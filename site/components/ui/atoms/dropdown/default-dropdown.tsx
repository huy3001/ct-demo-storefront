import React, { ChangeEvent, ComponentProps, FC } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import useClassNames from '@/hooks/useClassNames';
import useControllableState from '@/hooks/useControllableState';

export interface DropdownProps extends ComponentProps<'select'> {
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  items: Array<{ label: string; value: string }>;
  label?: string;
  value?: string;
  defaultValue?: string;
  error?: boolean;
}

const DefaultDropdown: FC<DropdownProps> = ({
  className = '',
  containerClassName = '',
  labelClassName,
  label,
  items,
  onChange,
  value,
  error,
  ...props
}) => {
  const [selectedValue, setSelectedValue] = useControllableState(value);
  const translate = useTranslations();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange?.(e);
  };

  const containerClassNames = useClassNames(['grid', containerClassName]);

  const selectClassName = useClassNames([
    'absolute appearance-none font-body z-1 h-10 text-sm border border-gray-300 focus:ring-0 focus:outline-none rounded-sm w-full focus:border-gray-400 bg-white disabled:bg-neutral-200 bg-none font-regular leading-loose pl-3 pr-0 py-0',
    className,
    {
      'border-red-500': error,
    },
  ]);

  const labelClassNames = useClassNames(['mb-2 text-gray-600 leading-loose font-medium text-sm', labelClassName]);

  return (
    <div className={containerClassNames}>
      {label && (
        <label htmlFor={props.name} className={labelClassNames}>{`${label}${props.required ? ' *' : ''}`}</label>
      )}

      <div className="relative h-10 min-w-16 overflow-hidden">
        <select id={props.name} className={selectClassName} value={selectedValue} onChange={handleChange} {...props}>
          {items.map(({ label, value }, index) => (
            <option key={index} value={value}>
              {label}
            </option>
          ))}
        </select>

        <ChevronDownIcon
          data-testid="chevron-down-icon"
          className="absolute right-1 top-1/2 z-2 h-5 w-7.5 -translate-y-1/2 stroke-1 text-charcoal"
        />
      </div>
      <p className="mt-0.5 text-xs font-medium text-red-500">{error && translate('common.fieldIsRequired')}</p>
    </div>
  );
};

export default DefaultDropdown;
