import type {
  ApprovalRule as CtApprovalRule,
  ApprovalRuleDraft as CtApprovalRuleDraft,
  ApprovalRuleUpdateAction,
  ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';
import {
  APPROVER_ROLES,
  buildRulePredicate,
  parseRulePredicate,
} from '@/lib/approval-rules';
import type {
  ApprovalRule,
  ApprovalRuleDetails,
  ApprovalRuleDraft,
  ApprovalRuleStatus,
  ApproverRole,
} from '@/types/approval-rule';

function businessUnitApi(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId: customerId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function roleReference(key: string) {
  return { typeId: 'associate-role' as const, key };
}

function isApproverRole(key: string): key is ApproverRole {
  return APPROVER_ROLES.includes(key as ApproverRole);
}

function toApprovalRule(rule: CtApprovalRule): ApprovalRule {
  return {
    id: rule.id,
    name: rule.name,
    requester: rule.requesters
      .map(({ associateRole }) => capitalize(associateRole.key))
      .join(', '),
    status: rule.status as ApprovalRuleStatus,
  };
}

function toApprovalRuleDetails(rule: CtApprovalRule): ApprovalRuleDetails {
  return {
    ...toApprovalRule(rule),
    description: rule.description ?? '',
    requesterRoles: rule.requesters.map(({ associateRole }) => associateRole.key),
    conditions: parseRulePredicate(rule.predicate),
    tiers: rule.approvers.tiers.map((tier, tierIndex) => ({
      id: `tier-${rule.id}-${tierIndex}`,
      approvers: tier.and
        .flatMap(({ or }) => or.map(({ associateRole }) => associateRole.key))
        .filter(isApproverRole)
        .map((role, approverIndex) => ({
          id: `approver-${rule.id}-${tierIndex}-${approverIndex}`,
          role,
          saved: true,
        })),
    })),
  };
}

// Every approver listed in a tier is required: each role becomes its own AND-ed disjunction.
function toApproverHierarchy(tiers: ApprovalRuleDraft['tiers']) {
  return {
    tiers: tiers.map((tier) => ({
      and: tier.approvers.flatMap(({ role }) =>
        role ? [{ or: [{ associateRole: roleReference(role) }] }] : [],
      ),
    })),
  };
}

function isForbidden(error: unknown): boolean {
  return (error as { statusCode?: number }).statusCode === 403;
}

export async function listApprovalRules(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
): Promise<ApprovalRule[]> {
  try {
    const { body } = await businessUnitApi(apiRoot, customerId, businessUnitKey)
      .approvalRules()
      .get({ queryArgs: { limit: 100, sort: ['createdAt desc'] } })
      .execute();
    return body.results.map(toApprovalRule);
  } catch (error) {
    // The associate's roles do not grant access to this business unit's rules.
    if (isForbidden(error)) return [];
    throw error;
  }
}

export async function getApprovalRule(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
  ruleId: string,
): Promise<ApprovalRuleDetails> {
  const { body } = await businessUnitApi(apiRoot, customerId, businessUnitKey)
    .approvalRules()
    .withId({ ID: ruleId })
    .get()
    .execute();
  return toApprovalRuleDetails(body);
}

export async function createApprovalRule(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
  draft: ApprovalRuleDraft,
): Promise<ApprovalRuleDetails> {
  const body: CtApprovalRuleDraft = {
    name: draft.name,
    ...(draft.description ? { description: draft.description } : {}),
    status: draft.status,
    predicate: buildRulePredicate(draft.conditions),
    requesters: draft.requesterRoles.map((role) => ({
      associateRole: roleReference(role),
    })),
    approvers: toApproverHierarchy(draft.tiers),
  };
  const { body: created } = await businessUnitApi(
    apiRoot,
    customerId,
    businessUnitKey,
  )
    .approvalRules()
    .post({ body })
    .execute();
  return toApprovalRuleDetails(created);
}

export async function updateApprovalRule(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
  ruleId: string,
  draft: ApprovalRuleDraft,
): Promise<ApprovalRuleDetails> {
  const rule = businessUnitApi(apiRoot, customerId, businessUnitKey)
    .approvalRules()
    .withId({ ID: ruleId });
  // Read-then-write so the update never uses a stale version.
  const { body: current } = await rule.get().execute();
  const actions: ApprovalRuleUpdateAction[] = [
    { action: 'setName', name: draft.name },
    { action: 'setDescription', description: draft.description },
    { action: 'setStatus', status: draft.status },
    { action: 'setPredicate', predicate: buildRulePredicate(draft.conditions) },
    {
      action: 'setRequesters',
      requesters: draft.requesterRoles.map((role) => ({
        associateRole: roleReference(role),
      })),
    },
    { action: 'setApprovers', approvers: toApproverHierarchy(draft.tiers) },
  ];
  const { body: updated } = await rule
    .post({ body: { version: current.version, actions } })
    .execute();
  return toApprovalRuleDetails(updated);
}
