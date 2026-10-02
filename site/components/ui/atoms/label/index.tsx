import React from 'react';
import { useTranslations } from 'use-intl';
import { LabelProps } from './types';

const Label = ({
  children,
  required,
  showOptionalLabel,
  optionalLabel,
  requiredStyle = 'asterisk',
  htmlFor,
}: React.PropsWithChildren<LabelProps>) => {
  const translate = useTranslations();

  if (!children && !required) return <></>;

  return (
    <div className="mb-2 flex items-center justify-between">
      {children && (
        <label
          aria-label={htmlFor}
          data-testid="label"
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium"
        >
          <span className="text-gray-600">{children}</span>
          {!required && showOptionalLabel && (
            <span className="inline-flex lowercase text-gray-600">
              {optionalLabel ?? `(${translate('common.optional')})`}
            </span>
          )}
          {required && requiredStyle === 'asterisk' && <span>*</span>}
        </label>
      )}
      {required && requiredStyle === 'label' && (
        <span className="text-xs text-gray-500">
          {translate('common.field-required')}
        </span>
      )}
    </div>
  );
};

export default Label;
