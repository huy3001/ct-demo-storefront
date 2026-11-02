export type ApprovalRuleStatus = 'Active' | 'Inactive';

export interface ApprovalRule {
  id: string;
  name: string;
  requester: string;
  status: ApprovalRuleStatus;
}

export type RuleConnector = 'and' | 'or';

export type RulePredicate = 'cart-amount' | 'currency' | 'country';

export type RuleOperator =
  | 'equal'
  | 'more'
  | 'more-equal'
  | 'less'
  | 'less-equal'
  | 'is'
  | 'is-not';

export type ApproverRole = 'admin' | 'approver' | 'reviewer';

export interface RuleCondition {
  id: string;
  /** How this condition combines with the one before it. */
  connector: RuleConnector;
  predicate: RulePredicate | '';
  operator: RuleOperator | '';
  value: string;
  saved: boolean;
}

export interface TierApprover {
  id: string;
  role: ApproverRole | '';
  saved: boolean;
}

export interface ApproverTier {
  id: string;
  approvers: TierApprover[];
}

export interface ApprovalRuleDetails extends ApprovalRule {
  description: string;
  requesterRoles: string[];
  conditions: RuleCondition[];
  tiers: ApproverTier[];
}

export type ApprovalRuleDraft = Omit<ApprovalRuleDetails, 'id' | 'requester'>;
