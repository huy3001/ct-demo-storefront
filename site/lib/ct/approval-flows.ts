import type {
  ApprovalFlow as CtApprovalFlow,
  ApprovalFlowStatus as CtApprovalFlowStatus,
  BusinessUnit,
  ByProjectKeyRequestBuilder,
  Order,
  RuleApprover,
} from '@commercetools/platform-sdk';
import type {
  ApprovalDecision,
  ApprovalFlow,
  ApprovalFlowStatus,
} from '@/types/approval-flow';
import { notifyApprovers } from './approval-flow-notifications';

const STATUS_MAP: Record<CtApprovalFlowStatus, ApprovalFlowStatus> = {
  Pending: 'Pending approval',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

const ADMIN_ROLE = 'admin';
// commercetools allows at most five approval tiers per rule.
const MAX_TIERS = 5;
const MAX_PARENT_HOPS = 10;
const SYNC_INTERVAL_MS = 30_000;

type AssociateRoles = Map<string, Set<string>>;

function statusError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), { statusCode });
}

function businessUnitApi(
  apiRoot: ByProjectKeyRequestBuilder,
  associateId: string,
  businessUnitKey: string,
) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });
}

function roleKeys(approvers: RuleApprover[]): string[] {
  return [...new Set(approvers.map(({ associateRole }) => associateRole.key))];
}

function hasAnyRole(roles: Set<string>, required: string[]): boolean {
  return required.some((role) => roles.has(role));
}

/**
 * Associates of a unit with every role that applies to it: roles assigned on the unit itself
 * plus roles inherited from ancestor units (only assignments with inheritance enabled).
 */
async function getEffectiveAssociates(
  apiRoot: ByProjectKeyRequestBuilder,
  unit: BusinessUnit,
): Promise<AssociateRoles> {
  const result: AssociateRoles = new Map();
  const add = (customerId: string, role: string) => {
    const roles = result.get(customerId) ?? new Set<string>();
    roles.add(role);
    result.set(customerId, roles);
  };

  for (const associate of unit.associates) {
    for (const { associateRole } of associate.associateRoleAssignments) {
      add(associate.customer.id, associateRole.key);
    }
  }

  let parent = unit.parentUnit;
  for (let hop = 0; parent && hop < MAX_PARENT_HOPS; hop += 1) {
    const { body: parentUnit } = await apiRoot
      .businessUnits()
      .withKey({ key: parent.key })
      .get()
      .execute();
    for (const associate of parentUnit.associates) {
      for (const { associateRole, inheritance } of associate.associateRoleAssignments) {
        if (inheritance === 'Enabled') add(associate.customer.id, associateRole.key);
      }
    }
    parent = parentUnit.parentUnit;
  }
  return result;
}

/** Assigned approvers of the matched rules (every tier) and admins may decide; admins override. */
function canDecide(flow: CtApprovalFlow, roles: Set<string>): boolean {
  if (flow.status !== 'Pending') return false;
  return (
    roles.has(ADMIN_ROLE) || hasAnyRole(roles, roleKeys(flow.pendingApprovers))
  );
}

function toApprovalFlow(
  flow: CtApprovalFlow,
  businessUnitName: string,
  businessUnitKey: string,
  viewerRoles: Set<string>,
): ApprovalFlow {
  const order: Order | undefined = flow.order.obj;
  return {
    id: flow.id,
    orderId: flow.order.id,
    orderNumber: order?.orderNumber ?? flow.order.id,
    status: STATUS_MAP[flow.status],
    createdAt: flow.createdAt,
    businessUnit: businessUnitName,
    businessUnitKey,
    skus: (order?.lineItems ?? []).flatMap(({ variant }) =>
      variant.sku ? [variant.sku] : [],
    ),
    ...(order
      ? {
          total: {
            centAmount: order.totalPrice.centAmount,
            currencyCode: order.totalPrice.currencyCode,
          },
        }
      : {}),
    canDecide: canDecide(flow, viewerRoles),
    ...(flow.rejection?.reason ? { rejectionReason: flow.rejection.reason } : {}),
  };
}

/** Notifies the assigned approvers and admins once per pending flow. */
async function notifyPendingFlows(
  apiRoot: ByProjectKeyRequestBuilder,
  flows: CtApprovalFlow[],
  associates: AssociateRoles,
  businessUnitKey: string,
): Promise<void> {
  for (const flow of flows) {
    if (flow.status !== 'Pending') continue;
    const approverRoles = roleKeys(flow.pendingApprovers);
    const recipientIds = [...associates]
      .filter(
        ([, roles]) => roles.has(ADMIN_ROLE) || hasAnyRole(roles, approverRoles),
      )
      .map(([customerId]) => customerId);
    await notifyApprovers(apiRoot, recipientIds, {
      id: flow.id,
      businessUnitKey,
      orderNumber: flow.order.obj?.orderNumber ?? flow.order.id,
    });
  }
}

/**
 * Lists the approval flows commercetools created for orders of a business unit.
 * commercetools evaluates the approval rules when the order is placed; flows still
 * pending here trigger their one-time in-app notification as a side effect.
 */
export async function listApprovalFlows(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
): Promise<ApprovalFlow[]> {
  const unitApi = businessUnitApi(apiRoot, customerId, businessUnitKey);
  try {
    const [{ body: flows }, { body: unit }] = await Promise.all([
      unitApi
        .approvalFlows()
        .get({
          queryArgs: {
            limit: 100,
            sort: ['createdAt desc'],
            expand: ['order'],
          },
        })
        .execute(),
      apiRoot
        .asAssociate()
        .withAssociateIdValue({ associateId: customerId })
        .businessUnits()
        .withKey({ key: businessUnitKey })
        .get()
        .execute(),
    ]);
    const associates = await getEffectiveAssociates(apiRoot, unit);
    const viewerRoles = associates.get(customerId) ?? new Set<string>();
    // Notification delivery must never break the listing.
    await notifyPendingFlows(
      apiRoot,
      flows.results,
      associates,
      businessUnitKey,
    ).catch(() => undefined);
    return flows.results.map((flow) =>
      toApprovalFlow(flow, unit.name, businessUnitKey, viewerRoles),
    );
  } catch (error) {
    // commercetools answers 403 when the associate cannot update approval flows.
    if ((error as { statusCode?: number }).statusCode === 403) return [];
    throw error;
  }
}

const lastSync = new Map<string, number>();

/** Scans the signed-in associate's business units so new pending flows notify their approvers. */
export async function syncPendingFlowNotifications(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<void> {
  const now = Date.now();
  if (now - (lastSync.get(customerId) ?? 0) < SYNC_INTERVAL_MS) return;
  lastSync.set(customerId, now);

  const { body } = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId: customerId })
    .businessUnits()
    .get({ queryArgs: { limit: 100 } })
    .execute();
  await Promise.allSettled(
    body.results.map((unit) => listApprovalFlows(apiRoot, customerId, unit.key)),
  );
}

/**
 * Approves or rejects a pending flow as a single-step decision.
 *
 * Only admins and the assigned approvers may decide. commercetools only accepts an action from
 * an associate whose role is listed in the rule's tiers, so when the caller is an admin
 * overriding the rule, the action is performed by an eligible associate of the unit instead.
 * An approval is repeated for every remaining tier so the flow ends as Approved.
 */
export async function decideApprovalFlow(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
  flowId: string,
  decision: ApprovalDecision,
  reason?: string,
): Promise<ApprovalFlowStatus> {
  const trimmedReason = reason?.trim();
  if (decision === 'reject' && !trimmedReason) {
    throw statusError(400, 'A reason is required to reject an approval flow');
  }

  const { body: unit } = await apiRoot
    .businessUnits()
    .withKey({ key: businessUnitKey })
    .get()
    .execute();
  const associates = await getEffectiveAssociates(apiRoot, unit);
  const callerRoles = associates.get(customerId) ?? new Set<string>();

  const flowApi = (associateId: string) =>
    businessUnitApi(apiRoot, associateId, businessUnitKey)
      .approvalFlows()
      .withId({ ID: flowId });

  let { body: flow } = await flowApi(customerId).get().execute();
  if (flow.status !== 'Pending') {
    throw statusError(409, 'This approval flow has already been decided');
  }
  if (!canDecide(flow, callerRoles)) {
    throw statusError(403, 'You are not allowed to decide this approval flow');
  }

  for (let step = 0; flow.status === 'Pending' && step < MAX_TIERS; step += 1) {
    const required = roleKeys(
      decision === 'approve' ? flow.currentTierPendingApprovers : flow.eligibleApprovers,
    );
    const actorId = hasAnyRole(callerRoles, required)
      ? customerId
      : [...associates].find(([, roles]) => hasAnyRole(roles, required))?.[0];
    if (!actorId) {
      throw statusError(409, 'No eligible approver is available for this approval flow');
    }

    ({ body: flow } = await flowApi(actorId)
      .post({
        body: {
          version: flow.version,
          actions: [
            decision === 'approve'
              ? { action: 'approve' }
              : { action: 'reject', reason: trimmedReason },
          ],
        },
      })
      .execute());
    if (decision === 'reject') break;
  }

  if (flow.status === 'Pending') {
    throw statusError(409, 'The approval flow could not be completed');
  }
  return STATUS_MAP[flow.status];
}
