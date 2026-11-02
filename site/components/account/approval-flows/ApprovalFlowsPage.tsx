'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import Dropdown from '@/components/ui/atoms/dropdown';
import Tabs from '@/components/ui/organisms/tabs';
import type { CompanyManagement } from '@/lib/company';
import type { ApprovalFlow } from '@/types/approval-flow';
import ApprovalFlowsTabContent from './ApprovalFlowsTabContent';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load company information');
  return response.json() as Promise<CompanyManagement>;
};

const flowsFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load approval flows');
  return response.json() as Promise<ApprovalFlow[]>;
};

export default function ApprovalFlowsPage() {
  const translate = useTranslations();
  const { data } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });
  const [businessUnitKey, setBusinessUnitKey] = useState('');
  const selectedBusinessUnitKey = businessUnitKey || data?.company.key || '';
  const { data: flows = [] } = useSWR(
    selectedBusinessUnitKey
      ? `/api/account/approval-flows?businessUnitKey=${encodeURIComponent(selectedBusinessUnitKey)}`
      : null,
    flowsFetcher,
    { revalidateOnFocus: false },
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        {translate('account.approval-flows')}
      </h1>

      <div className="w-full lg:max-w-xs">
        <Dropdown
          label={translate('account.business-unit')}
          name="business-unit"
          value={selectedBusinessUnitKey}
          onChange={(event) => setBusinessUnitKey(event.target.value)}
          items={(data?.businessUnits ?? []).map((businessUnit) => ({
            label: businessUnit.name,
            value: businessUnit.key,
          }))}
        />
      </div>

      <div>
        <Tabs>
          <Tabs.TabList>
            <Tabs.Tab>
              {translate('account.approval-flows-status-pending')}
            </Tabs.Tab>
            <Tabs.Tab>
              {translate('account.approval-flows-status-accepted')}
            </Tabs.Tab>
            <Tabs.Tab>
              {translate('account.approval-flows-status-rejected')}
            </Tabs.Tab>
          </Tabs.TabList>
          <Tabs.Panels>
            <Tabs.Panel>
              <ApprovalFlowsTabContent
              status="Pending approval"
              flows={flows}
            />
            </Tabs.Panel>
            <Tabs.Panel>
              <ApprovalFlowsTabContent
              status="Approved"
              flows={flows}
            />
            </Tabs.Panel>
            <Tabs.Panel>
              <ApprovalFlowsTabContent
              status="Rejected"
              flows={flows}
            />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>
    </div>
  );
}
