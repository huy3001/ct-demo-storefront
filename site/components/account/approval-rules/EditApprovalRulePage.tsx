'use client';

import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import { getApprovalRule } from '@/lib/approval-rules';
import ApprovalRuleForm from './ApprovalRuleForm';

export default function EditApprovalRulePage({ ruleId }: { ruleId: string }) {
  const translate = useTranslations();
  const rule = getApprovalRule(ruleId);

  if (!rule) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">
          {translate('account.approval-rules-edit')}
        </h1>
        <p className="text-sm text-gray-600">
          {translate('account.approval-rule-not-found')}
        </p>
        <Link link="/account/approval-rules" className="text-sm underline">
          {translate('account.approval-rules')}
        </Link>
      </div>
    );
  }

  return <ApprovalRuleForm key={rule.id} rule={rule} />;
}
