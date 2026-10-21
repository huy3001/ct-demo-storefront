'use client';

import { useTranslations } from 'use-intl';
import { classnames } from '@/helpers/utils/classnames';
import type { ApprovalFlowStatus } from '@/types/approval-flow';

export const APPROVAL_FLOW_STATUS_LABEL_KEYS: Record<
  ApprovalFlowStatus,
  string
> = {
  'Pending approval': 'account.approval-flows-status-pending',
  Approved: 'account.approval-flows-status-accepted',
  Rejected: 'account.approval-flows-status-rejected',
};

const STATUS_CLASSNAMES: Record<ApprovalFlowStatus, string> = {
  'Pending approval': 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function ApprovalFlowStatusBadge({
  status,
}: {
  status: ApprovalFlowStatus;
}) {
  const translate = useTranslations();

  return (
    <span
      className={classnames(
        'inline-flex rounded-sm px-2 py-0.5 text-xs',
        STATUS_CLASSNAMES[status],
      )}
    >
      {translate(APPROVAL_FLOW_STATUS_LABEL_KEYS[status])}
    </span>
  );
}
