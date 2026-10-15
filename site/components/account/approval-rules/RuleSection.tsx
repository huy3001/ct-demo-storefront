'use client';

import { useLocale, useTranslations } from 'use-intl';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { classnames } from '@/helpers/utils/classnames';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import Input from '@/components/ui/atoms/input';
import {
  RULE_PREDICATES,
  createCondition,
  getOperatorsFor,
  getSupportedCountries,
  getSupportedCurrencies,
  isCompleteCondition,
  isNumericInput,
} from '@/lib/approval-rules';
import type {
  RuleCondition,
  RuleConnector,
  RuleOperator,
  RulePredicate,
} from '@/types/approval-rule';

interface RuleSectionProps {
  conditions: RuleCondition[];
  isPreview: boolean;
  showError: boolean;
  onChange: (conditions: RuleCondition[]) => void;
  onPreview: () => void;
  onEdit: () => void;
}

const CONNECTORS: RuleConnector[] = ['and', 'or'];

function ConnectorToggle({
  value,
  onChange,
}: {
  value: RuleConnector;
  onChange: (value: RuleConnector) => void;
}) {
  const translate = useTranslations();

  return (
    <div
      role="radiogroup"
      className="inline-flex overflow-hidden rounded-sm border border-gray-300"
    >
      {CONNECTORS.map((connector) => (
        <button
          key={connector}
          type="button"
          role="radio"
          aria-checked={value === connector}
          onClick={() => onChange(connector)}
          className={classnames(
            'h-8 px-3 text-xs font-semibold uppercase',
            value === connector
              ? 'bg-charcoal text-white'
              : 'bg-white text-gray-600 hover:bg-neutral-200',
          )}
        >
          {translate(`account.approval-rule-${connector}`)}
        </button>
      ))}
    </div>
  );
}

function ConditionRow({
  condition,
  index,
  isOnlyRow,
  onChange,
  onDelete,
  onAddRow,
}: {
  condition: RuleCondition;
  index: number;
  isOnlyRow: boolean;
  onChange: (condition: RuleCondition) => void;
  onDelete: () => void;
  onAddRow: () => void;
}) {
  const translate = useTranslations();
  const locale = useLocale();
  const operators = getOperatorsFor(condition.predicate);
  const isSelectValue =
    condition.predicate === 'currency' || condition.predicate === 'country';
  const valueOptions =
    condition.predicate === 'currency'
      ? getSupportedCurrencies(locale)
      : getSupportedCountries(locale);
  const fieldName = `rule-${condition.id}`;

  // Any edit invalidates a previously saved row until "Add rule" is clicked again.
  const update = (changes: Partial<RuleCondition>) =>
    onChange({ ...condition, ...changes, saved: false });

  return (
    <div className="space-y-2">
      {index > 0 && (
        <ConnectorToggle
          value={condition.connector}
          onChange={(connector) => onChange({ ...condition, connector })}
        />
      )}
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-full sm:w-60">
          <Dropdown
            name={`${fieldName}-predicate`}
            aria-label={translate('account.approval-rule-select-predicate')}
            value={condition.predicate}
            onChange={(event) =>
              update({
                predicate: event.target.value as RulePredicate | '',
                operator: '',
                value: '',
              })
            }
            items={[
              {
                label: translate('account.approval-rule-select-predicate'),
                value: '',
              },
              ...RULE_PREDICATES.map((predicate) => ({
                label: translate(`account.approval-rule-predicate-${predicate}`),
                value: predicate,
              })),
            ]}
          />
        </div>

        <div className="w-full sm:w-60">
          <Dropdown
            name={`${fieldName}-operator`}
            aria-label={translate('account.approval-rule-select-operator')}
            value={condition.operator}
            disabled={!condition.predicate}
            onChange={(event) =>
              update({ operator: event.target.value as RuleOperator | '' })
            }
            items={[
              { label: '', value: '' },
              ...operators.map((operator) => ({
                label: translate(`account.approval-rule-operator-${operator}`),
                value: operator,
              })),
            ]}
          />
        </div>

        {condition.predicate && (
          <div className="w-full sm:w-60">
            {isSelectValue ? (
              <Dropdown
                name={`${fieldName}-value`}
                aria-label={translate('account.approval-rule-select-value')}
                value={condition.value}
                onChange={(event) => update({ value: event.target.value })}
                items={[{ label: '', value: '' }, ...valueOptions]}
              />
            ) : (
              <Input
                name={`${fieldName}-value`}
                aria-label={translate('account.approval-rule-amount')}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={condition.value}
                hideCheckIcon
                onChange={(event) => {
                  if (isNumericInput(event.target.value)) {
                    update({ value: event.target.value });
                  }
                }}
              />
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            aria-label={translate('common.delete')}
            disabled={isOnlyRow}
            onClick={onDelete}
            icon={<TrashIcon className="size-5" />}
          />
          {condition.saved ? (
            <Button
              type="button"
              aria-label={translate('account.approval-rule-add-row')}
              onClick={onAddRow}
              icon={<PlusIcon className="size-5" />}
            />
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="fit"
              className="h-10 whitespace-nowrap px-4 text-sm"
              disabled={!isCompleteCondition(condition)}
              onClick={() => onChange({ ...condition, saved: true })}
            >
              {translate('account.approval-rule-add-rule')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function conditionValueLabel(
  condition: RuleCondition,
  locale: string,
): string {
  if (condition.predicate === 'currency') {
    return (
      getSupportedCurrencies(locale).find(
        (option) => option.value === condition.value,
      )?.label ?? condition.value
    );
  }
  if (condition.predicate === 'country') {
    return (
      getSupportedCountries(locale).find(
        (option) => option.value === condition.value,
      )?.label ?? condition.value
    );
  }
  return condition.value;
}

function RulePreview({ conditions }: { conditions: RuleCondition[] }) {
  const translate = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {conditions.map((condition, index) => (
        <div key={condition.id} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-xs font-semibold uppercase text-gray-600">
              {translate(`account.approval-rule-${condition.connector}`)}
            </span>
          )}
          <span className="rounded-sm border border-gray-300 px-2 py-1 text-sm">
            {[
              translate(`account.approval-rule-predicate-${condition.predicate}`),
              translate(`account.approval-rule-operator-${condition.operator}`),
              conditionValueLabel(condition, locale),
            ].join(' ')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RuleSection({
  conditions,
  isPreview,
  showError,
  onChange,
  onPreview,
  onEdit,
}: RuleSectionProps) {
  const translate = useTranslations();
  const hasConditions = conditions.length > 0;

  const updateCondition = (updated: RuleCondition) =>
    onChange(
      conditions.map((condition) =>
        condition.id === updated.id ? updated : condition,
      ),
    );

  const addRowAfter = (id: string) => {
    const position = conditions.findIndex((condition) => condition.id === id);
    onChange([
      ...conditions.slice(0, position + 1),
      createCondition(),
      ...conditions.slice(position + 1),
    ]);
  };

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold">
          {translate('account.approval-rule-rule')} *
        </h2>
        <p className="text-sm text-gray-600">
          {translate('account.approval-rule-rule-description')}
        </p>
        {showError && !isPreview && (
          <p role="alert" className="mt-2 text-sm text-red-500">
            {translate('account.approval-rule-rules-incomplete')}
          </p>
        )}
      </div>

      {!hasConditions ? (
        <div className="flex items-center gap-3">
          <div className="h-10 flex-1 rounded-sm border border-gray-300 bg-white" />
          <Button
            type="button"
            size="fit"
            className="h-10 px-8 text-sm"
            onClick={() => onChange([createCondition()])}
          >
            {translate('account.approval-rule-add')}
          </Button>
        </div>
      ) : isPreview ? (
        <div className="flex items-start justify-between gap-4 rounded-sm border border-gray-300 bg-white p-4">
          <RulePreview conditions={conditions} />
          <Button
            type="button"
            variant="secondary"
            size="fit"
            className="h-8 px-4 text-sm"
            onClick={onEdit}
          >
            {translate('common.edit')}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 rounded-sm border border-gray-300 bg-white p-4">
            {conditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                index={index}
                isOnlyRow={conditions.length === 1}
                onChange={updateCondition}
                onDelete={() =>
                  onChange(conditions.filter(({ id }) => id !== condition.id))
                }
                onAddRow={() => addRowAfter(condition.id)}
              />
            ))}
          </div>
          <Button
            type="button"
            size="fit"
            className="h-10 px-8 text-sm"
            onClick={onPreview}
          >
            {translate('account.approval-rule-preview')}
          </Button>
        </>
      )}
    </section>
  );
}
