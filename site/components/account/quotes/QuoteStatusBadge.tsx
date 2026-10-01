'use client';

import { classnames } from '@/helpers/utils/classnames';
import type { QuoteStatus } from '@/types/quote';

const STATUS_CLASSNAMES: Record<QuoteStatus, string> = {
  Accepted: 'bg-green-100 text-green-800',
  Declined: 'bg-red-100 text-red-800',
  'Declined for Renegotiation': 'bg-red-100 text-red-800',
  Renegotiating: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
  Closed: 'bg-gray-100 text-gray-700',
  Rejected: 'bg-red-100 text-red-800',
  Submitted: 'bg-orange-100 text-orange-800',
  Withdrawn: 'bg-red-100 text-red-800',
};

export default function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={classnames(
        'inline-flex rounded px-2 py-0.5 text-12 font-medium',
        STATUS_CLASSNAMES[status],
      )}
    >
      {status}
    </span>
  );
}
