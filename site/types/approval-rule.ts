export type ApprovalRuleStatus = 'Active' | 'Inactive';

export interface ApprovalRule {
  id: string;
  name: string;
  requester: string;
  status: ApprovalRuleStatus;
}
