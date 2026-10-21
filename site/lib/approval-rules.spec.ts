import {
  buildRulePredicate,
  createCondition,
  parseApprovalRuleDraft,
  parseRulePredicate,
} from '@/lib/approval-rules';
import type { RuleCondition } from '@/types/approval-rule';

const condition = (overrides: Partial<RuleCondition>): RuleCondition => ({
  ...createCondition(),
  saved: true,
  ...overrides,
});

describe('[Lib] Approval rule predicates', () => {
  const conditions = [
    condition({ predicate: 'cart-amount', operator: 'more', value: '1000.5' }),
    condition({
      connector: 'and',
      predicate: 'currency',
      operator: 'is',
      value: 'USD',
    }),
    condition({
      connector: 'or',
      predicate: 'country',
      operator: 'is-not',
      value: 'DE',
    }),
  ];

  it('builds a commercetools order predicate with cent amounts', () => {
    expect(buildRulePredicate(conditions)).toBe(
      'totalPrice.centAmount > 100050 and totalPrice.currencyCode = "USD" or shippingAddress.country != "DE"',
    );
  });

  it('parses a built predicate back into the same conditions', () => {
    const parsed = parseRulePredicate(buildRulePredicate(conditions));

    expect(
      parsed.map(({ connector, predicate, operator, value }) => ({
        connector,
        predicate,
        operator,
        value,
      })),
    ).toEqual(
      conditions.map(({ connector, predicate, operator, value }) => ({
        connector,
        predicate,
        operator,
        value: predicate === 'cart-amount' ? '1000.5' : value,
      })),
    );
  });

  it('returns no conditions for predicates authored outside the form', () => {
    expect(parseRulePredicate('lineItemCount > 5')).toEqual([]);
  });
});

describe('[Lib] parseApprovalRuleDraft', () => {
  const valid = {
    name: ' Large orders ',
    requesterRoles: ['buyer'],
    conditions: [{ connector: 'and', predicate: 'cart-amount', operator: 'more', value: '10' }],
    tiers: [{ approvers: [{ role: 'approver' }] }],
    status: 'Active',
  };

  it('accepts a complete draft and trims text', () => {
    const draft = parseApprovalRuleDraft(valid);
    expect(draft.name).toBe('Large orders');
    expect(draft.requesterRoles).toEqual(['buyer']);
    expect(draft.status).toBe('Active');
  });

  it.each([
    ['a missing name', { ...valid, name: '' }],
    ['an unknown requester role', { ...valid, requesterRoles: ['owner'] }],
    ['an incomplete condition', { ...valid, conditions: [{ predicate: 'currency' }] }],
    ['an unknown approver role', { ...valid, tiers: [{ approvers: [{ role: 'buyer' }] }] }],
    ['an invalid status', { ...valid, status: 'Draft' }],
  ])('rejects %s with a 400', (_label, body) => {
    expect(() => parseApprovalRuleDraft(body)).toThrow(
      expect.objectContaining({ statusCode: 400 }),
    );
  });
});
