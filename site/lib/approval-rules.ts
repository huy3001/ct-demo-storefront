import { ASSOCIATE_ROLES } from '@/lib/company';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type {
  ApprovalRuleDraft,
  ApproverRole,
  ApproverTier,
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

const AMOUNT_SYMBOLS: Partial<Record<RuleOperator, string>> = {
  equal: '=',
  more: '>',
  'more-equal': '>=',
  less: '<',
  'less-equal': '<=',
};

const AMOUNT_OPERATORS_BY_SYMBOL = Object.fromEntries(
  Object.entries(AMOUNT_SYMBOLS).map(([operator, symbol]) => [
    symbol,
    operator as RuleOperator,
  ]),
);

const MEMBERSHIP_FIELDS: Record<'currency' | 'country', string> = {
  currency: 'totalPrice.currencyCode',
  country: 'shippingAddress.country',
};

const AMOUNT_FIELD = 'totalPrice.centAmount';

function conditionToPredicate(condition: RuleCondition): string {
  if (condition.predicate === 'cart-amount') {
    const centAmount = Math.round(Number(condition.value) * 100);
    return `${AMOUNT_FIELD} ${AMOUNT_SYMBOLS[condition.operator as RuleOperator]} ${centAmount}`;
  }
  const field = MEMBERSHIP_FIELDS[condition.predicate as 'currency' | 'country'];
  return `${field} ${condition.operator === 'is' ? '=' : '!='} "${condition.value}"`;
}

/** Builds the commercetools Order Predicate evaluated against every new order of the business unit. */
export function buildRulePredicate(conditions: RuleCondition[]): string {
  return conditions
    .map((condition, index) => {
      const expression = conditionToPredicate(condition);
      return index === 0 ? expression : `${condition.connector} ${expression}`;
    })
    .join(' ');
}

/** Inverse of buildRulePredicate. Returns [] when the predicate was authored elsewhere and cannot be edited as rows. */
export function parseRulePredicate(predicate: string): RuleCondition[] {
  const parts = predicate.trim().split(/\s+(and|or)\s+/);
  const conditions: RuleCondition[] = [];

  for (let index = 0; index < parts.length; index += 2) {
    const connector = index === 0 ? 'and' : (parts[index - 1] as 'and' | 'or');
    const expression = parts[index];
    const amount = expression.match(
      /^totalPrice\.centAmount\s*(>=|<=|=|>|<)\s*(\d+)$/,
    );
    const membership = expression.match(
      /^(totalPrice\.currencyCode|shippingAddress\.country)\s*(!=|=)\s*"([^"]+)"$/,
    );

    if (amount) {
      conditions.push({
        ...createCondition(),
        connector,
        predicate: 'cart-amount',
        operator: AMOUNT_OPERATORS_BY_SYMBOL[amount[1]],
        value: String(Number(amount[2]) / 100),
        saved: true,
      });
    } else if (membership) {
      conditions.push({
        ...createCondition(),
        connector,
        predicate:
          membership[1] === MEMBERSHIP_FIELDS.currency ? 'currency' : 'country',
        operator: membership[2] === '=' ? 'is' : 'is-not',
        value: membership[3],
        saved: true,
      });
    } else {
      return [];
    }
  }

  return conditions;
}

function invalid(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400 });
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid(`${field} is invalid`);
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) invalid(`${field} is invalid`);
  return value as unknown[];
}

/** Validates an untrusted request body into an approval rule draft. Throws an error carrying statusCode 400. */
export function parseApprovalRuleDraft(input: unknown): ApprovalRuleDraft {
  const body = asRecord(input, 'Approval rule');
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) invalid('Name is required');

  const requesterRoles = [
    ...new Set(asArray(body.requesterRoles, 'Requester roles')),
  ];
  if (
    requesterRoles.length === 0 ||
    requesterRoles.some(
      (role) =>
        typeof role !== 'string' ||
        !REQUESTER_ROLES.includes(role as (typeof REQUESTER_ROLES)[number]),
    )
  ) {
    invalid('At least one valid requester role is required');
  }

  const conditions = asArray(body.conditions, 'Conditions').map(
    (item): RuleCondition => {
      const condition = asRecord(item, 'Condition');
      return {
        id: createId('condition'),
        connector: condition.connector === 'or' ? 'or' : 'and',
        predicate: condition.predicate as RulePredicate,
        operator: condition.operator as RuleOperator,
        value: String(condition.value ?? ''),
        saved: true,
      };
    },
  );
  if (!areConditionsComplete(conditions)) invalid('Rule conditions are incomplete');

  const tiers = asArray(body.tiers, 'Tiers').map((item): ApproverTier => {
    const tier = asRecord(item, 'Tier');
    return {
      id: createId('tier'),
      approvers: asArray(tier.approvers, 'Approvers').map(
        (approver): TierApprover => ({
          id: createId('approver'),
          role: asRecord(approver, 'Approver').role as ApproverRole,
          saved: true,
        }),
      ),
    };
  });
  if (!areTiersComplete(tiers)) invalid('Approver tiers are incomplete');

  if (body.status !== 'Active' && body.status !== 'Inactive') {
    invalid('Status is invalid');
  }

  return {
    name,
    description:
      typeof body.description === 'string' ? body.description.trim() : '',
    requesterRoles: requesterRoles as string[],
    conditions,
    tiers,
    status: body.status,
  };
}
