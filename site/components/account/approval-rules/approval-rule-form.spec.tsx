import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@/__test__/utils';
import { useRouter } from '@/i18n/routing';
import type { ApprovalRuleDetails } from '@/types/approval-rule';
import ApprovalRuleForm from './ApprovalRuleForm';

const t = (key: string) => `account.approval-rule-${key}`;

const roleOptions = (select: HTMLElement) =>
  within(select)
    .getAllByRole('option')
    .map((option) => option.textContent);

async function fillBasics(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: /rule-name/ }), 'High value');
  await user.click(screen.getByTestId('multi-dropdown-button'));
  await user.click(screen.getByText(t('role-buyer')));
  await user.keyboard('{Escape}');
}

describe('[Component] Approval rule form', () => {
  it('starts empty with Save disabled and both sections showing an Add button', () => {
    render(<ApprovalRuleForm businessUnitKey="test-unit" />);

    expect(screen.getByRole('heading', { name: 'account.approval-rules-add' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: t('add') })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'common.save' })).toBeDisabled();
  });

  it('enables the operator dropdown and value field after a predicate is chosen', async () => {
    const user = userEvent.setup();
    render(<ApprovalRuleForm businessUnitKey="test-unit" />);

    await user.click(screen.getAllByRole('button', { name: t('add') })[0]);

    const predicate = screen.getByLabelText(t('select-predicate'));
    const operator = screen.getByLabelText(t('select-operator'));
    expect(operator).toBeDisabled();
    expect(screen.queryByLabelText(t('amount'))).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.delete' })).toBeDisabled();

    await user.selectOptions(predicate, 'cart-amount');
    expect(operator).toBeEnabled();
    expect(roleOptions(operator).slice(1)).toEqual([
      t('operator-equal'),
      t('operator-more'),
      t('operator-more-equal'),
      t('operator-less'),
      t('operator-less-equal'),
    ]);

    const amount = screen.getByLabelText(t('amount'));
    await user.type(amount, '12a.5b.3');
    expect(amount).toHaveValue('12.53');

    await user.selectOptions(predicate, 'currency');
    expect(roleOptions(screen.getByLabelText(t('select-operator'))).slice(1)).toEqual([
      t('operator-is'),
      t('operator-is-not'),
    ]);
    expect(screen.queryByLabelText(t('amount'))).not.toBeInTheDocument();
    expect(within(screen.getByLabelText(t('select-value'))).getAllByRole('option').length).toBeGreaterThan(1);
  });

  it('saves a row, adds another with "+", then previews and edits the rule set', async () => {
    const user = userEvent.setup();
    render(<ApprovalRuleForm businessUnitKey="test-unit" />);

    await user.click(screen.getAllByRole('button', { name: t('add') })[0]);
    await user.selectOptions(screen.getByLabelText(t('select-predicate')), 'cart-amount');
    await user.selectOptions(screen.getByLabelText(t('select-operator')), 'equal');
    await user.type(screen.getByLabelText(t('amount')), '1000');

    await user.click(screen.getByRole('button', { name: t('add-rule') }));
    expect(screen.queryByRole('button', { name: t('add-rule') })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: t('add-row') }));
    expect(screen.getAllByLabelText(t('select-predicate'))).toHaveLength(2);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();

    // The second row is incomplete, so previewing is refused.
    await user.click(screen.getByRole('button', { name: t('preview') }));
    expect(screen.getByRole('alert')).toHaveTextContent(t('rules-incomplete'));

    await user.click(screen.getAllByRole('button', { name: 'common.delete' })[1]);
    await user.click(screen.getByRole('button', { name: t('preview') }));
    expect(screen.getByText(`${t('predicate-cart-amount')} ${t('operator-equal')} 1000`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('preview') })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'common.edit' }));
    expect(screen.getByRole('button', { name: t('preview') })).toBeInTheDocument();
  });

  it('manages approver tiers', async () => {
    const user = userEvent.setup();
    render(<ApprovalRuleForm businessUnitKey="test-unit" />);

    await user.click(screen.getAllByRole('button', { name: t('add') })[1]);
    expect(screen.getByText('account.approval-rule-tier')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'common.remove' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: t('add-tier') }));
    expect(screen.getAllByRole('button', { name: 'common.remove' })).toHaveLength(2);

    await user.click(screen.getAllByRole('button', { name: 'common.remove' })[0]);
    expect(screen.queryByRole('button', { name: 'common.remove' })).not.toBeInTheDocument();

    const select = screen.getByLabelText(t('select-predicate'));
    expect(roleOptions(select).slice(1)).toEqual([t('role-admin'), t('role-approver'), t('role-reviewer')]);
    expect(screen.getByRole('button', { name: t('add-approver') })).toBeDisabled();

    await user.selectOptions(select, 'admin');
    await user.click(screen.getByRole('button', { name: t('add-approver') }));
    expect(screen.queryByRole('button', { name: t('add-approver') })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('add-row') })).toBeInTheDocument();
  });

  it('saves a complete rule and returns to the list', async () => {
    const user = userEvent.setup();
    const router = useRouter();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<ApprovalRuleForm businessUnitKey="test-unit" />);

    await fillBasics(user);

    await user.click(screen.getAllByRole('button', { name: t('add') })[0]);
    await user.selectOptions(screen.getByLabelText(t('select-predicate')), 'country');
    await user.selectOptions(screen.getByLabelText(t('select-operator')), 'is');
    await user.selectOptions(screen.getByLabelText(t('select-value')), 'US');
    await user.click(screen.getByRole('button', { name: t('preview') }));

    expect(screen.getByRole('button', { name: 'common.save' })).toBeDisabled();

    await user.click(screen.getAllByRole('button', { name: t('add') })[0]);
    await user.selectOptions(screen.getByLabelText(t('select-predicate')), 'approver');
    await user.click(screen.getByRole('button', { name: t('preview') }));

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/account/approval-rules'),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/account/approval-rules',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('asks for confirmation when cancelling', async () => {
    const user = userEvent.setup();
    const router = useRouter();
    (router.push as jest.Mock).mockClear();
    render(<ApprovalRuleForm businessUnitKey="test-unit" />);

    await user.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(screen.getByText(t('unsaved-title'))).toBeInTheDocument();
    expect(screen.getByText(t('unsaved-message'))).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'common.cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'common.cancel' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: t('leave') }));
    expect(router.push).toHaveBeenCalledWith('/account/approval-rules');
  });

  it('prefills an existing rule when editing', () => {
    const rule: ApprovalRuleDetails = {
      id: 'rule-1',
      name: 'Rule 1',
      requester: 'Admin',
      status: 'Active',
      description: '',
      requesterRoles: ['admin'],
      conditions: [
        {
          id: 'condition-1',
          connector: 'and',
          predicate: 'cart-amount',
          operator: 'more',
          value: '1000',
          saved: true,
        },
      ],
      tiers: [
        {
          id: 'tier-1',
          approvers: [{ id: 'approver-1', role: 'approver', saved: true }],
        },
      ],
    };
    render(
      <ApprovalRuleForm
        businessUnitKey="test-unit"
        rule={rule}
      />,
    );

    expect(screen.getByRole('heading', { name: 'account.approval-rules-edit' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /rule-name/ })).toHaveValue('Rule 1');
    expect(screen.getByRole('button', { name: 'common.save' })).toBeEnabled();
    expect(screen.getAllByRole('button', { name: 'common.edit' })).toHaveLength(2);
  });
});
