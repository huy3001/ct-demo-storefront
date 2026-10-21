export const APPROVAL_FLOW_STATUSES = [
  'Pending approval',
  'Accepted',
  'Rejected',
] as const;

export type ApprovalFlowStatus = (typeof APPROVAL_FLOW_STATUSES)[number];

export interface ApprovalFlow {
  /** Approval flow id, used for the detail route. */
  id: string;
  orderId: string;
  /** Shown in the ID column; falls back to the order id when the order has no number. */
  orderNumber: string;
  status: ApprovalFlowStatus;
  createdAt: string;
  businessUnit: string;
  /** Key of the business unit the flow belongs to; needed to look the flow up. */
  businessUnitKey: string;
  skus: string[];
  total?: { centAmount: number; currencyCode: string };
}
