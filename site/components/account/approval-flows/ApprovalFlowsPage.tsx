'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import Dropdown from '@/components/ui/atoms/dropdown';
import Tabs from '@/components/ui/organisms/tabs';
import type { CompanyManagement } from '@/lib/company';
import ApprovalFlowsTabContent from './ApprovalFlowsTabContent';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load company information');
  return response.json() as Promise<CompanyManagement>;
};

export default function ApprovalFlowsPage() {
  const translate = useTranslations();
  const { data } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });
  const [businessUnitId, setBusinessUnitId] = useState('');
  const selectedBusinessUnitId = businessUnitId || data?.company.id || '';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        {translate('account.approval-flows')}
      </h1>

      <div className="w-full lg:max-w-xs">
        <Dropdown
          label={translate('account.business-unit')}
          name="business-unit"
          value={selectedBusinessUnitId}
          onChange={(event) => setBusinessUnitId(event.target.value)}
          items={(data?.businessUnits ?? []).map((businessUnit) => ({
            label: businessUnit.name,
            value: businessUnit.id,
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
              <ApprovalFlowsTabContent status="Pending approval" />
            </Tabs.Panel>
            <Tabs.Panel>
              <ApprovalFlowsTabContent status="Accepted" />
            </Tabs.Panel>
            <Tabs.Panel>
              <ApprovalFlowsTabContent status="Rejected" />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>
    </div>
  );
}
