'use client';

import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Modal from '@/components/ui/organisms/modal';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  onStay,
  onLeave,
}: UnsavedChangesModalProps) {
  const translate = useTranslations();
  const title = translate('account.approval-rule-unsaved-title');

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      contentLabel={title}
      onRequestClose={onStay}
      style={{ content: { width: '100%', maxWidth: 'min(90%, 425px)' } }}
      closeButton
    >
      <div className="border-b border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="mt-3 text-sm text-gray-700">
          {translate('account.approval-rule-unsaved-message')}
        </p>
      </div>
      <div className="flex justify-end gap-3 p-6">
        <Button
          type="button"
          variant="secondary"
          size="fit"
          className="h-10 px-6 text-sm"
          onClick={onStay}
        >
          {translate('common.cancel')}
        </Button>
        <Button
          type="button"
          variant="warning"
          size="fit"
          className="h-10 px-6 text-sm"
          onClick={onLeave}
        >
          {translate('account.approval-rule-leave')}
        </Button>
      </div>
    </Modal>
  );
}
