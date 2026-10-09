import React, { ComponentProps, FC, useMemo, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import useClassNames from '@/hooks/useClassNames';
import { StringHelpers } from '@/helpers/stringHelpers';

export interface InputProps extends ComponentProps<'input'> {
  label?: string;
  labelDesc?: string;
  labelDescClassName?: string;
  variant?: 'primary' | 'secondary';
  labelPosition?: 'top' | 'inline';
  error?: string;
  errorMessage?: string;
  hideCheckIcon?: boolean;
  renderEndIcon?: () => React.ReactNode;
  isDirty?: boolean;
}

const Input: FC<InputProps> = ({
  label,
  labelDesc,
  variant = 'primary',
  labelPosition = 'top',
  className = '',
  errorMessage,
  children,
  hideCheckIcon,
  isDirty = false,
  onFocus,
  onBlur,
  error,
  labelDescClassName = '',
  name,
  required,
  ref,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const bgClassName = useMemo(
    () =>
      ({
        primary: 'bg-white',
        secondary: 'bg-neutral-200',
      })[variant],
    [variant],
  );

  const labelClassName = useClassNames([
    labelPosition ? 'leading-loose' : 'leading-normal',
    labelPosition === 'top' ? 'text-sm' : 'text-xxs',
    'font-medium',
    { ['text-gray-600']: labelPosition === 'top' },
    { [isFocused && label ? 'opacity-1 scale-100' : 'scale-0 opacity-0']: labelPosition === 'inline' },
    {
      ['absolute top-1.5 left-3 font-medium block transition duration-150 ease-out']: labelPosition === 'inline',
    },
  ]);

  const labelContainerClassName = useClassNames([
    {
      'mb-2': labelPosition === 'top',
    },
  ]);

  const inputClassName = useClassNames([
    'h-10 focus:border-gray-400 focus:ring-0 w-full rounded-sm border border-gray-300 px-3 text-charcoal text-sm placeholder:text-sm placeholder:leading-normal placeholder:text-gray-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300',
    bgClassName,
    isFocused && label && labelPosition == 'inline' ? 'pt-5 pb-1' : 'py-2.5',
    {
      'border-red-500 focus:border-red-500': !!error,
    },
    { 'border-green-500 focus:border-green-500': !error && isFocused && isDirty },
    className,
  ]);

  const id = StringHelpers.convertToKebabCase(name || '');

  return (
    <div className="relative">
      <div className={labelContainerClassName}>
        {label && (
          <label className={labelClassName} htmlFor={id}>
            {required ? `${label} *` : label}
          </label>
        )}
        {labelDesc && <label className={labelDescClassName || 'text-sm text-gray-500'}>{` (${labelDesc})`}</label>}
      </div>
      <div className="relative">
        <input
          className={inputClassName}
          ref={ref}
          id={id}
          name={name}
          {...(error && { 'aria-describedby': `${id}_input_error` })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isDirty && !error && !isFocused && !hideCheckIcon && (
          <CheckIcon
            data-testid="check-icon"
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-500"
          />
        )}
        {children}
      </div>
      {error && (
        <span className="text-xs font-medium leading-4 text-red-500" id={`${id}_input_error`}>
          {error ?? errorMessage}
        </span>
      )}
    </div>
  );
};

export default Input;
