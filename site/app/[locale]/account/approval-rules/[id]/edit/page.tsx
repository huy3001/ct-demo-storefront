import EditApprovalRulePage from '@/components/account/approval-rules/EditApprovalRulePage';

export default async function AccountEditApprovalRulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ businessUnit?: string }>;
}) {
  const { id: ruleId } = await params;
  const { businessUnit } = await searchParams;
  return (
    <EditApprovalRulePage
      ruleId={ruleId}
      businessUnitKey={businessUnit ?? ''}
    />
  );
}
