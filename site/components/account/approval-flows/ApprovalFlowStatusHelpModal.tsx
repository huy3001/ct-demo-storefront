'use client';

import { useTranslations } from 'use-intl';
import Modal from '@/components/ui/organisms/modal';
import { APPROVAL_FLOW_STATUSES } from '@/types/approval-flow';
import ApprovalFlowStatusBadge from './ApprovalFlowStatusBadge';

const DESCRIPTION_KEYS = {
  'Pending approval': 'account.approval-flows-status-description-pending',
  Accepted: 'account.approval-flows-status-description-accepted',
  Rejected: 'account.approval-flows-status-description-rejected',
} as const;

type ApprovalFlowStatusHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export default function ApprovalFlowStatusHelpModal({
  isOpen,
  onClose,
  title,
}: ApprovalFlowStatusHelpModalProps) {
  const translate = useTranslations();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      closeButton
      preventScroll
      contentLabel={title}
      style={{ content: { width: 'fit', maxWidth: 'min(90%, 768px)' } }}
    >
      <div className="px-6 py-8 max-h-[90vh] overflow-y-auto">
        <h2 className="pr-8 text-xl font-semibold text-charcoal">{title}</h2>
        <ul className="mt-6 space-y-4">
          {APPROVAL_FLOW_STATUSES.map((status) => (
            <li
              key={status}
              className="flex flex-col items-start gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0"
            >
              <ApprovalFlowStatusBadge status={status} />
              <p className="text-sm">{translate(DESCRIPTION_KEYS[status])}</p>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
