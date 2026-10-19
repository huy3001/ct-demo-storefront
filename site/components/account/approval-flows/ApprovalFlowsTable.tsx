'use client';

import { useTranslations } from 'use-intl';
import { useParams } from 'next/navigation';
import Link from '@/components/ui/atoms/link';
import Table from '@/components/ui/organisms/table';
import { formatMoney } from '@/lib/utils';
import type { ApprovalFlow, ApprovalFlowStatus } from '@/types/approval-flow';
import ApprovalFlowStatusBadge from './ApprovalFlowStatusBadge';

interface ApprovalFlowsTableProps {
  status: ApprovalFlowStatus;
  statusFilter?: ApprovalFlowStatus[];
  flows?: ApprovalFlow[];
}

export default function ApprovalFlowsTable({
  status,
  statusFilter = [],
  flows = [],
}: ApprovalFlowsTableProps) {
  const translate = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const visibleFlows = flows.filter(
    (flow) =>
      flow.status === status &&
      (statusFilter.length === 0 || statusFilter.includes(flow.status)),
  );

  return (
    <Table>
      <Table.Container>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>
              {translate('account.approval-flows-column-status')}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {translate('account.approval-flows-column-id')}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {translate('account.approval-flows-column-date')}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {translate('account.approval-flows-column-business-unit')}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {translate('account.approval-flows-column-total')}
            </Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {visibleFlows.map((flow) => (
            <Table.Row key={flow.id}>
              <Table.Cell
                cellHeading={translate('account.approval-flows-column-status')}
              >
                <ApprovalFlowStatusBadge status={flow.status} />
              </Table.Cell>
              <Table.Cell
                cellHeading={translate('account.approval-flows-column-id')}
              >
                <span>{flow.id}</span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate('account.approval-flows-column-date')}
              >
                <span>
                  {new Date(flow.createdAt).toLocaleDateString(locale)}
                </span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate(
                  'account.approval-flows-column-business-unit',
                )}
              >
                <span>{flow.businessUnit}</span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate('account.approval-flows-column-total')}
              >
                <span>
                  {formatMoney(
                    flow.total.centAmount,
                    flow.total.currencyCode,
                    locale,
                  )}
                </span>
              </Table.Cell>
              <Table.Cell
                cellHeading={translate('account.approval-flows-column-action')}
                className="lg:text-right"
                isButtonsCell
              >
                <Link
                  variant="primary"
                  link={`/account/approval-flows/${flow.id}`}
                  className="text-terra hover:underline whitespace-nowrap"
                >
                  {translate('account.approval-flows-view')}
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </Table>
  );
}
