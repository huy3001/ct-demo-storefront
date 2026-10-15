'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import { useRouter } from '@/i18n/routing';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import Tabs from '@/components/ui/organisms/tabs';
import type { CompanyManagement } from '@/lib/company';
import { listApprovalRules } from '@/lib/approval-rules';
import ApprovalRulesTable from './ApprovalRulesTable';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load company information');
  return response.json() as Promise<CompanyManagement>;
};

export default function ApprovalRulesPage() {
  const translate = useTranslations();
  const router = useRouter();
  const { data } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });
  const rules = listApprovalRules();
  const [businessUnitId, setBusinessUnitId] = useState('');
  const selectedBusinessUnitId = businessUnitId || data?.company.id || '';

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
            value={selectedBusinessUnitId}
            onChange={(event) => setBusinessUnitId(event.target.value)}
            items={(data?.businessUnits ?? []).map((businessUnit) => ({
              label: businessUnit.name,
              value: businessUnit.id,
            }))}
          />
        </div>
        <Button
          type="button"
          className="shrink-0 whitespace-nowrap"
          onClick={() => router.push('/account/approval-rules/add')}
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
                status="Active"
              />
            </Tabs.Panel>
            <Tabs.Panel>
              <ApprovalRulesTable
                rules={rules}
                status="Inactive"
              />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>
    </div>
  );
}
