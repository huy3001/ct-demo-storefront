import type {
  ApprovalFlow as CtApprovalFlow,
  ApprovalFlowStatus as CtApprovalFlowStatus,
  ByProjectKeyRequestBuilder,
  Order,
} from '@commercetools/platform-sdk';
import type { ApprovalFlow, ApprovalFlowStatus } from '@/types/approval-flow';

const STATUS_MAP: Record<CtApprovalFlowStatus, ApprovalFlowStatus> = {
  Pending: 'Pending approval',
  Approved: 'Accepted',
  Rejected: 'Rejected',
};

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

function toApprovalFlow(
  flow: CtApprovalFlow,
  businessUnitName: string,
): ApprovalFlow {
  const order: Order | undefined = flow.order.obj;
  return {
    id: flow.id,
    orderId: flow.order.id,
    orderNumber: order?.orderNumber ?? flow.order.id,
    status: STATUS_MAP[flow.status],
    createdAt: flow.createdAt,
    businessUnit: businessUnitName,
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
  };
}

/** Lists the approval flows commercetools created for orders of a business unit. */
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
    return flows.results.map((flow) => toApprovalFlow(flow, unit.name));
  } catch (error) {
    // commercetools answers 403 when the associate cannot update approval flows.
    if ((error as { statusCode?: number }).statusCode === 403) return [];
    throw error;
  }
}
