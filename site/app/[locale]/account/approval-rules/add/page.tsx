import ApprovalRuleForm from '@/components/account/approval-rules/ApprovalRuleForm';

export default async function AddApprovalRulePage({
  searchParams,
}: {
  searchParams: Promise<{ businessUnit?: string }>;
}) {
  const { businessUnit } = await searchParams;
  return <ApprovalRuleForm businessUnitKey={businessUnit ?? ''} />;
}
