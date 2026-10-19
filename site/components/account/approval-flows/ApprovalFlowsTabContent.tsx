'use client';

import { useState } from 'react';
import { useTranslations } from 'use-intl';
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Input from '@/components/ui/atoms/input';
import Label from '@/components/ui/atoms/label';
import MultiDropdown from '@/components/ui/atoms/multi-dropdown';
import {
  APPROVAL_FLOW_STATUSES,
  type ApprovalFlowStatus,
} from '@/types/approval-flow';
import { APPROVAL_FLOW_STATUS_LABEL_KEYS } from './ApprovalFlowStatusBadge';
import ApprovalFlowStatusHelpModal from './ApprovalFlowStatusHelpModal';
import ApprovalFlowsTable from './ApprovalFlowsTable';

export default function ApprovalFlowsTabContent({
  status,
}: {
  status: ApprovalFlowStatus;
}) {
  const translate = useTranslations();
  const [search, setSearch] = useState('');
  const [selectedStatuses, setStatuses] = useState<string[]>([]);
  const statuses = APPROVAL_FLOW_STATUSES.filter((option) =>
    selectedStatuses.includes(option),
  );
  const [isStatusHelpOpen, setIsStatusHelpOpen] = useState(false);

  const statusButtonLabel =
    statuses.length === 0
      ? translate('account.approval-flows-status')
      : statuses.length === 1
        ? translate(APPROVAL_FLOW_STATUS_LABEL_KEYS[statuses[0]])
        : translate('account.approval-flows-status-selected', {
            count: statuses.length,
          });

  const mockFlows = [
    {
      id: 'flow-1',
      status: 'Pending approval' as ApprovalFlowStatus,
      createdAt: new Date().toISOString(),
      businessUnit: 'Liberty Crane Solutions LLC',
      total: { centAmount: 100000, currencyCode: 'USD' },
    },
    {
      id: 'flow-2',
      status: 'Accepted' as ApprovalFlowStatus,
      createdAt: new Date().toISOString(),
      businessUnit: 'Liberty Crane Solutions LLC',
      total: { centAmount: 200000, currencyCode: 'USD' },
    },
    {
      id: 'flow-3',
      status: 'Rejected' as ApprovalFlowStatus,
      createdAt: new Date().toISOString(),
      businessUnit: 'Liberty Crane Solutions LLC',
      total: { centAmount: 300000, currencyCode: 'USD' },
    }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <div className="relative">
            <Input
              label={translate('account.approval-flows-search-label')}
              id={`search-approval-flows-${status}`}
              name="search-approval-flows"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={translate(
                'account.approval-flows-search-placeholder',
              )}
              aria-label={translate('account.approval-flows-search-label')}
              className="pr-10"
            />
            {search ? (
              <button
                type="button"
                aria-label={translate('common.clear')}
                className="absolute right-3 bottom-3 flex items-center"
                onClick={() => setSearch('')}
              >
                <XMarkIcon className="size-4 text-charcoal" />
              </button>
            ) : (
              <MagnifyingGlassIcon className="pointer-events-none absolute right-3 bottom-3 size-4 text-charcoal" />
            )}
          </div>
        </div>

        <div className="w-full lg:max-w-xs">
          <Label
            showOptionalLabel
            optionalLabel={
              <button
                type="button"
                aria-label={translate('account.approval-flows-status-help')}
                className="text-charcoal hover:text-terra"
                onClick={() => setIsStatusHelpOpen(true)}
              >
                <QuestionMarkCircleIcon className="size-5" />
              </button>
            }
          >
            {translate('account.approval-flows-status')}
          </Label>
          <MultiDropdown
            value={selectedStatuses}
            onChange={setStatuses}
            className="w-full"
          >
            <MultiDropdown.Button className="w-full">
              {statusButtonLabel}
            </MultiDropdown.Button>
            <MultiDropdown.Options>
              {APPROVAL_FLOW_STATUSES.map((option) => (
                <MultiDropdown.Option
                  key={option}
                  value={option}
                >
                  {translate(APPROVAL_FLOW_STATUS_LABEL_KEYS[option])}
                </MultiDropdown.Option>
              ))}
            </MultiDropdown.Options>
          </MultiDropdown>
        </div>
      </div>

      <ApprovalFlowsTable
        status={status}
        statusFilter={statuses}
        flows={mockFlows}
      />

      <ApprovalFlowStatusHelpModal
        isOpen={isStatusHelpOpen}
        onClose={() => setIsStatusHelpOpen(false)}
        title={translate('account.approval-flows-status-help-title')}
      />
    </div>
  );
}
