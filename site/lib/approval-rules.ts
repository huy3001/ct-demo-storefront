import { ASSOCIATE_ROLES } from '@/lib/company';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type {
  ApproverRole,
  ApproverTier,
  ApprovalRule,
  ApprovalRuleDetails,
  ApprovalRuleDraft,
  RuleCondition,
  RuleOperator,
  RulePredicate,
  TierApprover,
} from '@/types/approval-rule';

export const REQUESTER_ROLES = ASSOCIATE_ROLES;

export const APPROVER_ROLES: readonly ApproverRole[] = [
  'admin',
  'approver',
  'reviewer',
];

export const RULE_PREDICATES: readonly RulePredicate[] = [
  'cart-amount',
  'currency',
  'country',
];

const AMOUNT_OPERATORS: readonly RuleOperator[] = [
  'equal',
  'more',
  'more-equal',
  'less',
  'less-equal',
];

const MEMBERSHIP_OPERATORS: readonly RuleOperator[] = ['is', 'is-not'];

export function getOperatorsFor(
  predicate: RulePredicate | '',
): readonly RuleOperator[] {
  if (predicate === 'cart-amount') return AMOUNT_OPERATORS;
  if (predicate === 'currency' || predicate === 'country') {
    return MEMBERSHIP_OPERATORS;
  }
  return [];
}

const DECIMAL_INPUT = /^\d*\.?\d*$/;
const DECIMAL_VALUE = /^\d+(\.\d+)?$/;

/** Used while typing: allows partial values such as "12." */
export function isNumericInput(value: string): boolean {
  return DECIMAL_INPUT.test(value);
}

export function isCompleteCondition(condition: RuleCondition): boolean {
  if (!condition.predicate || !condition.operator || !condition.value) {
    return false;
  }
  if (!getOperatorsFor(condition.predicate).includes(condition.operator)) {
    return false;
  }
  return condition.predicate === 'cart-amount'
    ? DECIMAL_VALUE.test(condition.value)
    : true;
}

export function isCompleteApprover(approver: TierApprover): boolean {
  return APPROVER_ROLES.includes(approver.role as ApproverRole);
}

export function areConditionsComplete(conditions: RuleCondition[]): boolean {
  return conditions.length > 0 && conditions.every(isCompleteCondition);
}

export function areTiersComplete(tiers: ApproverTier[]): boolean {
  return (
    tiers.length > 0 &&
    tiers.every(
      (tier) =>
        tier.approvers.length > 0 && tier.approvers.every(isCompleteApprover),
    )
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

function displayNames(locale: string, type: 'currency' | 'region') {
  try {
    return new Intl.DisplayNames([locale], { type });
  } catch {
    return undefined;
  }
}

/** Currencies and countries supported by the storefront's configured markets. */
export function getSupportedCurrencies(locale: string): SelectOption[] {
  const names = displayNames(locale, 'currency');
  const codes = [
    ...new Set(Object.values(COUNTRY_CONFIG).map(({ currency }) => currency)),
  ];
  return codes.map((code) => ({
    value: code,
    label: `${names?.of(code) ?? code} (${code})`,
  }));
}

export function getSupportedCountries(locale: string): SelectOption[] {
  const names = displayNames(locale, 'region');
  const codes = [
    ...new Set(Object.values(COUNTRY_CONFIG).map(({ country }) => country)),
  ];
  return codes.map((code) => ({
    value: code,
    label: names?.of(code) ?? code,
  }));
}

let sequence = 0;

export function createId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function createCondition(): RuleCondition {
  return {
    id: createId('condition'),
    connector: 'and',
    predicate: '',
    operator: '',
    value: '',
    saved: false,
  };
}

export function createApprover(): TierApprover {
  return { id: createId('approver'), role: '', saved: false };
}

export function createTier(): ApproverTier {
  return { id: createId('tier'), approvers: [createApprover()] };
}

const SEED_RULES: ApprovalRuleDetails[] = [
  {
    id: 'rule-1',
    name: 'Rule 1',
    requester: 'Admin',
    status: 'Active',
    description: '',
    requesterRoles: ['admin'],
    conditions: [
      {
        id: 'seed-condition-1',
        connector: 'and',
        predicate: 'cart-amount',
        operator: 'more',
        value: '1000',
        saved: true,
      },
    ],
    tiers: [
      {
        id: 'seed-tier-1',
        approvers: [{ id: 'seed-approver-1', role: 'approver', saved: true }],
      },
    ],
  },
  {
    id: 'rule-2',
    name: 'Rule 2',
    requester: 'Buyer',
    status: 'Inactive',
    description: '',
    requesterRoles: ['buyer'],
    conditions: [
      {
        id: 'seed-condition-2',
        connector: 'and',
        predicate: 'currency',
        operator: 'is',
        value: 'USD',
        saved: true,
      },
    ],
    tiers: [
      {
        id: 'seed-tier-2',
        approvers: [{ id: 'seed-approver-2', role: 'admin', saved: true }],
      },
    ],
  },
];

// No approval rules data source exists yet, so rules live in memory for the session.
const store: ApprovalRuleDetails[] = [...SEED_RULES];

export function listApprovalRules(): ApprovalRule[] {
  return store.map(({ id, name, requester, status }) => ({
    id,
    name,
    requester,
    status,
  }));
}

export function getApprovalRule(id: string): ApprovalRuleDetails | undefined {
  return store.find((rule) => rule.id === id);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function saveApprovalRule(
  draft: ApprovalRuleDraft,
  id?: string,
): ApprovalRuleDetails {
  const rule: ApprovalRuleDetails = {
    ...draft,
    id: id ?? createId('rule'),
    requester: draft.requesterRoles.map(capitalize).join(', '),
  };
  const index = store.findIndex((item) => item.id === rule.id);
  if (index === -1) store.push(rule);
  else store[index] = rule;
  return rule;
}
