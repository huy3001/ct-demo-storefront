'use client';

import { useTranslations } from 'use-intl';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import {
  APPROVER_ROLES,
  createApprover,
  createTier,
  isCompleteApprover,
} from '@/lib/approval-rules';
import type {
  ApproverRole,
  ApproverTier,
  TierApprover,
} from '@/types/approval-rule';

interface ApproversSectionProps {
  tiers: ApproverTier[];
  isPreview: boolean;
  showError: boolean;
  onChange: (tiers: ApproverTier[]) => void;
  onPreview: () => void;
  onEdit: () => void;
}

function ApproverRow({
  approver,
  fieldName,
  isOnlyRow,
  onChange,
  onDelete,
  onAddRow,
}: {
  approver: TierApprover;
  fieldName: string;
  isOnlyRow: boolean;
  onChange: (approver: TierApprover) => void;
  onDelete: () => void;
  onAddRow: () => void;
}) {
  const translate = useTranslations();

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="w-full sm:w-80">
        <Dropdown
          name={fieldName}
          aria-label={translate('account.approval-rule-select-predicate')}
          value={approver.role}
          onChange={(event) =>
            onChange({
              ...approver,
              role: event.target.value as ApproverRole | '',
              saved: false,
            })
          }
          items={[
            {
              label: translate('account.approval-rule-select-predicate'),
              value: '',
            },
            ...APPROVER_ROLES.map((role) => ({
              label: translate(`account.approval-rule-role-${role}`),
              value: role,
            })),
          ]}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          aria-label={translate('common.delete')}
          disabled={isOnlyRow}
          onClick={onDelete}
          icon={<TrashIcon className="size-5" />}
        />
        {approver.saved ? (
          <Button
            type="button"
            aria-label={translate('account.approval-rule-add-row')}
            onClick={onAddRow}
            icon={<PlusIcon className="size-5" />}
          />
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="fit"
            className="h-10 whitespace-nowrap px-4 text-sm"
            disabled={!isCompleteApprover(approver)}
            onClick={() => onChange({ ...approver, saved: true })}
          >
            {translate('account.approval-rule-add-approver')}
          </Button>
        )}
      </div>
    </div>
  );
}

function TierBox({
  tier,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  tier: ApproverTier;
  index: number;
  canRemove: boolean;
  onChange: (tier: ApproverTier) => void;
  onRemove: () => void;
}) {
  const translate = useTranslations();

  const updateApprover = (updated: TierApprover) =>
    onChange({
      ...tier,
      approvers: tier.approvers.map((approver) =>
        approver.id === updated.id ? updated : approver,
      ),
    });

  const addRowAfter = (id: string) => {
    const position = tier.approvers.findIndex((approver) => approver.id === id);
    onChange({
      ...tier,
      approvers: [
        ...tier.approvers.slice(0, position + 1),
        createApprover(),
        ...tier.approvers.slice(position + 1),
      ],
    });
  };

  return (
    <div className="space-y-4 rounded-sm border border-gray-300 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium">
          {translate('account.approval-rule-tier', { number: index + 1 })}
        </h3>
        {canRemove && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs hover:underline"
            onClick={onRemove}
          >
            {translate('common.remove')}
            <TrashIcon className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {tier.approvers.map((approver) => (
        <ApproverRow
          key={approver.id}
          approver={approver}
          fieldName={`approver-${approver.id}`}
          isOnlyRow={tier.approvers.length === 1}
          onChange={updateApprover}
          onDelete={() =>
            onChange({
              ...tier,
              approvers: tier.approvers.filter(({ id }) => id !== approver.id),
            })
          }
          onAddRow={() => addRowAfter(approver.id)}
        />
      ))}
    </div>
  );
}

function ApproversPreview({ tiers }: { tiers: ApproverTier[] }) {
  const translate = useTranslations();

  return (
    <div className="flex-1 divide-y divide-gray-300">
      {tiers.map((tier, index) => (
        <div
          key={tier.id}
          className="flex flex-wrap items-center gap-2 py-3 first:pt-0 last:pb-0"
        >
          <span className="rounded-sm bg-neutral-200 px-3 py-1 text-sm font-medium">
            {translate('account.approval-rule-tier', { number: index + 1 })}
          </span>
          {tier.approvers.map((approver) => (
            <span
              key={approver.id}
              className="rounded-sm border border-gray-300 px-2 py-1 text-sm"
            >
              {translate(`account.approval-rule-role-${approver.role}`)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ApproversSection({
  tiers,
  isPreview,
  showError,
  onChange,
  onPreview,
  onEdit,
}: ApproversSectionProps) {
  const translate = useTranslations();
  const hasTiers = tiers.length > 0;

  const updateTier = (updated: ApproverTier) =>
    onChange(tiers.map((tier) => (tier.id === updated.id ? updated : tier)));

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold">
          {translate('account.approval-rule-approvers')} *
        </h2>
        <p className="text-sm text-gray-600">
          {translate('account.approval-rule-approvers-description')}
        </p>
        {showError && !isPreview && (
          <p role="alert" className="mt-2 text-sm text-red-500">
            {translate('account.approval-rule-approvers-incomplete')}
          </p>
        )}
      </div>

      {!hasTiers ? (
        <div className="flex items-center gap-3">
          <div className="h-10 flex-1 rounded-sm border border-gray-300 bg-white" />
          <Button
            type="button"
            size="fit"
            className="h-10 px-8 text-sm"
            onClick={() => onChange([createTier()])}
          >
            {translate('account.approval-rule-add')}
          </Button>
        </div>
      ) : isPreview ? (
        <div className="flex items-start justify-between gap-4 rounded-sm border border-gray-300 bg-white p-4">
          <ApproversPreview tiers={tiers} />
          <Button
            type="button"
            variant="secondary"
            size="fit"
            className="h-8 px-4 text-sm"
            onClick={onEdit}
          >
            {translate('common.edit')}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <TierBox
                key={tier.id}
                tier={tier}
                index={index}
                canRemove={tiers.length > 1}
                onChange={updateTier}
                onRemove={() =>
                  onChange(tiers.filter(({ id }) => id !== tier.id))
                }
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              size="fit"
              className="h-10 px-8 text-sm"
              onClick={onPreview}
            >
              {translate('account.approval-rule-preview')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="fit"
              className="h-10 px-4 text-sm"
              onClick={() => onChange([...tiers, createTier()])}
            >
              {translate('account.approval-rule-add-tier')}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
