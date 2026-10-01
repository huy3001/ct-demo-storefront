'use client';

import Modal from '@/components/ui/organisms/modal';
import { QUOTE_STATUSES } from '@/types/quote';
import QuoteStatusBadge from './QuoteStatusBadge';

type QuoteStatusHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export default function QuoteStatusHelpModal({
  isOpen,
  onClose,
  title,
}: QuoteStatusHelpModalProps) {
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
      <div className="px-6 py-8">
        <h2 className="pr-8 text-20 font-semibold text-charcoal">{title}</h2>
        <ul className="mt-6 space-y-4">
          {QUOTE_STATUSES.map((status) => (
            <li
              key={status}
              className="flex items-start gap-3"
            >
              <QuoteStatusBadge status={status} />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
