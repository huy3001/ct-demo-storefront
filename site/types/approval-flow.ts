export const APPROVAL_FLOW_STATUSES = [
  'Pending approval',
  'Accepted',
  'Rejected',
] as const;

export type ApprovalFlowStatus = (typeof APPROVAL_FLOW_STATUSES)[number];

export interface ApprovalFlow {
  id: string;
  status: ApprovalFlowStatus;
  createdAt: string;
  businessUnit: string;
  total: { centAmount: number; currencyCode: string };
}
