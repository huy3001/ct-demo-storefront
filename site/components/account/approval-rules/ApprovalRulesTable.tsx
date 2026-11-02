'use client';

import { useTranslations } from 'use-intl';
import { classnames } from '@/helpers/utils/classnames';
import Link from '@/components/ui/atoms/link';
import Table from '@/components/ui/organisms/table';
import type { ApprovalRule, ApprovalRuleStatus } from '@/types/approval-rule';

interface ApprovalRulesTableProps {
  rules: ApprovalRule[];
  businessUnitKey: string;
  status: ApprovalRuleStatus;
}

export default function ApprovalRulesTable({
  rules,
  businessUnitKey,
  status,
}: ApprovalRulesTableProps) {
  const translate = useTranslations();
  const visibleRules = rules.filter((rule) => rule.status === status);

  return (
    <Table>
      <Table.Container>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>
              {translate('account.approval-rules-column-name')}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {translate('account.approval-rules-column-requester')}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {translate('account.approval-rules-column-status')}
            </Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {visibleRules.map((rule) => (
            <Table.Row key={rule.id}>
              <Table.Cell
                cellHeading={translate('account.approval-rules-column-name')}
              >
                <span>{rule.name}</span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate(
                  'account.approval-rules-column-requester',
                )}
              >
                <span>{rule.requester}</span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate('account.approval-rules-column-status')}
              >
                <span
                  className={classnames(
                    'inline-flex rounded-sm px-2 py-0.5 text-xs',
                    rule.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  )}
                >
                  {translate(
                    rule.status === 'Active'
                      ? 'account.approval-rules-status-active'
                      : 'account.approval-rules-status-inactive',
                  )}
                </span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate('account.approval-rules-column-action')}
                className="lg:text-right"
                isButtonsCell
              >
                <Link
                  link={`/account/approval-rules/${rule.id}/edit?businessUnit=${encodeURIComponent(businessUnitKey)}`}
                  aria-label={translate('account.approval-rules-edit')}
                  className="inline-flex text-terra hover:text-terra"
                >
                  {translate('common.edit')}
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </Table>
  );
}
