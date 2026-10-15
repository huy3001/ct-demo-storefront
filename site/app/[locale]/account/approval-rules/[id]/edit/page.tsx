import EditApprovalRulePage from '@/components/account/approval-rules/EditApprovalRulePage';

export default async function AccountEditApprovalRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ruleId } = await params;
  return <EditApprovalRulePage ruleId={ruleId} />;
}
