'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import { useRouter } from '@/i18n/routing';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import Tabs from '@/components/ui/organisms/tabs';
import type { CompanyManagement } from '@/lib/company';
import type { ApprovalRule } from '@/types/approval-rule';
import ApprovalRulesTable from './ApprovalRulesTable';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load company information');
  return response.json() as Promise<CompanyManagement>;
};

const rulesFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load approval rules');
  return response.json() as Promise<ApprovalRule[]>;
};

export default function ApprovalRulesPage() {
  const translate = useTranslations();
  const router = useRouter();
  const { data } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });
  const [businessUnitKey, setBusinessUnitKey] = useState('');
  const selectedBusinessUnitKey = businessUnitKey || data?.company.key || '';
  const { data: rules = [] } = useSWR(
    selectedBusinessUnitKey
      ? `/api/account/approval-rules?businessUnitKey=${encodeURIComponent(selectedBusinessUnitKey)}`
      : null,
    rulesFetcher,
    { revalidateOnFocus: false },
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        {translate('account.approval-rules')}
      </h1>

      <div className="flex items-end justify-between gap-4">
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
        <Button
          type="button"
          className="shrink-0 whitespace-nowrap"
          disabled={!selectedBusinessUnitKey}
          onClick={() =>
            router.push(
              `/account/approval-rules/add?businessUnit=${encodeURIComponent(selectedBusinessUnitKey)}`,
            )
          }
        >
          {translate('account.approval-rules-add')}
        </Button>
      </div>

      <div>
        <Tabs>
          <Tabs.TabList>
            <Tabs.Tab>
              {translate('account.approval-rules-status-active')}
            </Tabs.Tab>
            <Tabs.Tab>
              {translate('account.approval-rules-status-inactive')}
            </Tabs.Tab>
          </Tabs.TabList>
          <Tabs.Panels>
            <Tabs.Panel>
              <ApprovalRulesTable
                rules={rules}
                businessUnitKey={selectedBusinessUnitKey}
                status="Active"
              />
            </Tabs.Panel>
            <Tabs.Panel>
              <ApprovalRulesTable
                rules={rules}
                businessUnitKey={selectedBusinessUnitKey}
                status="Inactive"
              />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>
    </div>
  );
}
