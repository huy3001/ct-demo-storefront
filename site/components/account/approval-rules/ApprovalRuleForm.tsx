'use client';

import { useState } from 'react';
import { useTranslations } from 'use-intl';
import { useRouter } from '@/i18n/routing';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import MultiDropdown from '@/components/ui/atoms/multi-dropdown';
import Toggle from '@/components/ui/atoms/toggle';
import InfoTooltip from '@/components/ui/atoms/tooltip';
import {
  REQUESTER_ROLES,
  areConditionsComplete,
  areTiersComplete,
  saveApprovalRule,
} from '@/lib/approval-rules';
import type {
  ApprovalRuleDetails,
  ApproverTier,
  RuleCondition,
} from '@/types/approval-rule';
import ApproversSection from './ApproversSection';
import RuleSection from './RuleSection';
import UnsavedChangesModal from './UnsavedChangesModal';

const LIST_PATH = '/account/approval-rules';

interface ApprovalRuleFormProps {
  rule?: ApprovalRuleDetails;
}

export default function ApprovalRuleForm({ rule }: ApprovalRuleFormProps) {
  const translate = useTranslations();
  const router = useRouter();
  const isEdit = !!rule;

  const [name, setName] = useState(rule?.name ?? '');
  const [description, setDescription] = useState(rule?.description ?? '');
  const [requesterRoles, setRequesterRoles] = useState<string[]>(
    rule?.requesterRoles ?? [],
  );
  const [conditions, setConditions] = useState<RuleCondition[]>(
    rule?.conditions ?? [],
  );
  const [tiers, setTiers] = useState<ApproverTier[]>(rule?.tiers ?? []);
  const [isRulePreview, setIsRulePreview] = useState(isEdit);
  const [isApproversPreview, setIsApproversPreview] = useState(isEdit);
  const [showRuleError, setShowRuleError] = useState(false);
  const [showApproversError, setShowApproversError] = useState(false);
  const [active, setActive] = useState(rule ? rule.status === 'Active' : true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // A section only counts once it has been previewed (committed).
  const canSave =
    name.trim().length > 0 &&
    requesterRoles.length > 0 &&
    isRulePreview &&
    conditions.length > 0 &&
    isApproversPreview &&
    tiers.length > 0;

  const roleLabel = (role: string) =>
    translate(`account.approval-rule-role-${role}`);

  const changeConditions = (next: RuleCondition[]) => {
    setConditions(next);
    setShowRuleError(false);
  };

  const changeTiers = (next: ApproverTier[]) => {
    setTiers(next);
    setShowApproversError(false);
  };

  const previewRule = () => {
    if (!areConditionsComplete(conditions)) {
      setShowRuleError(true);
      return;
    }
    setConditions(conditions.map((condition) => ({ ...condition, saved: true })));
    setIsRulePreview(true);
  };

  const previewApprovers = () => {
    if (!areTiersComplete(tiers)) {
      setShowApproversError(true);
      return;
    }
    setTiers(
      tiers.map((tier) => ({
        ...tier,
        approvers: tier.approvers.map((approver) => ({
          ...approver,
          saved: true,
        })),
      })),
    );
    setIsApproversPreview(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    saveApprovalRule(
      {
        name: name.trim(),
        description: description.trim(),
        requesterRoles,
        conditions,
        tiers,
        status: active ? 'Active' : 'Inactive',
      },
      rule?.id,
    );
    router.push(LIST_PATH);
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">
        {translate(
          isEdit
            ? 'account.approval-rules-edit'
            : 'account.approval-rules-add',
        )}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <div className="max-w-xs space-y-4">
          <Input
            label={translate('account.approval-rule-name')}
            name="rule-name"
            required
            value={name}
            hideCheckIcon
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label={translate('account.approval-rule-description')}
            labelDesc={translate('common.optional').toLowerCase()}
            name="rule-description"
            value={description}
            hideCheckIcon
            onChange={(event) => setDescription(event.target.value)}
          />
          <div>
            <InfoTooltip
              className="mb-2"
              content={translate('account.approval-rule-requester-roles-tooltip')}
            >
              <span className="text-sm font-medium text-gray-600">
                {translate('account.approval-rule-requester-roles')} *
              </span>
            </InfoTooltip>
            <MultiDropdown
              value={requesterRoles}
              onChange={setRequesterRoles}
              className="w-full"
            >
              <MultiDropdown.Button className="w-full">
                {requesterRoles.map(roleLabel).join(', ')}
              </MultiDropdown.Button>
              <MultiDropdown.Options>
                {REQUESTER_ROLES.map((role) => (
                  <MultiDropdown.Option key={role} value={role}>
                    {roleLabel(role)}
                  </MultiDropdown.Option>
                ))}
              </MultiDropdown.Options>
            </MultiDropdown>
          </div>
        </div>

        <RuleSection
          conditions={conditions}
          isPreview={isRulePreview}
          showError={showRuleError}
          onChange={(next) => {
            changeConditions(next);
            setIsRulePreview(false);
          }}
          onPreview={previewRule}
          onEdit={() => setIsRulePreview(false)}
        />

        <ApproversSection
          tiers={tiers}
          isPreview={isApproversPreview}
          showError={showApproversError}
          onChange={(next) => {
            changeTiers(next);
            setIsApproversPreview(false);
          }}
          onPreview={previewApprovers}
          onEdit={() => setIsApproversPreview(false)}
        />

        <div className="flex items-center gap-3">
          <Toggle
            label={translate('account.approval-rule-set-active')}
            checked={active}
            onChange={setActive}
          />
          <span className="text-sm text-gray-600">
            {translate(
              active
                ? 'account.approval-rules-status-active'
                : 'account.approval-rules-status-inactive',
            )}
          </span>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="fit"
            className="h-10 w-40 text-sm"
            onClick={() => setIsLeaveModalOpen(true)}
          >
            {translate('common.cancel')}
          </Button>
          <Button
            type="submit"
            size="fit"
            className="h-10 w-40 text-sm"
            disabled={!canSave}
          >
            {translate('common.save')}
          </Button>
        </div>
      </form>

      <UnsavedChangesModal
        isOpen={isLeaveModalOpen}
        onStay={() => setIsLeaveModalOpen(false)}
        onLeave={() => router.push(LIST_PATH)}
      />
    </div>
  );
}
