'use client';

import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import Skeleton from '@/components/ui/atoms/skeleton';
import type { ApprovalRuleDetails } from '@/types/approval-rule';
import ApprovalRuleForm from './ApprovalRuleForm';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load approval rule');
  return response.json() as Promise<ApprovalRuleDetails>;
};

export default function EditApprovalRulePage({
  ruleId,
  businessUnitKey,
}: {
  ruleId: string;
  businessUnitKey: string;
}) {
  const translate = useTranslations();
  const { data: rule, error } = useSWR(
    businessUnitKey
      ? `/api/account/approval-rules/${encodeURIComponent(ruleId)}?businessUnitKey=${encodeURIComponent(businessUnitKey)}`
      : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  if (businessUnitKey && !rule && !error) {
    return <Skeleton className="h-5 w-full" />;
  }

  if (!rule) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">
          {translate('account.approval-rules-edit')}
        </h1>
        <p className="text-sm text-gray-600">
          {translate('account.approval-rule-not-found')}
        </p>
        <Link
          link="/account/approval-rules"
          className="text-sm underline"
        >
          {translate('account.approval-rules')}
        </Link>
      </div>
    );
  }

  return (
    <ApprovalRuleForm
      key={rule.id}
      businessUnitKey={businessUnitKey}
      rule={rule}
    />
  );
}
