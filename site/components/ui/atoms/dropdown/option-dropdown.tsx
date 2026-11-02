import React, { useCallback, useEffect } from 'react';
import { Listbox, Transition, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import useControllableState from '@/hooks/useControllableState';
import { Option } from './index';

export interface Props {
  error?: boolean;
  label?: string;
  required?: boolean;
  labelClassName?: string;
  options?: Option[];
  value?: Option;
  defaultValue?: Option;
  onChange?: (option: Option) => void;
  selectButtonClassName?: string;
}

const Select: React.FC<Props> = ({
  error,
  onChange,
  value,
  defaultValue,
  label,
  required,
  labelClassName = '',
  selectButtonClassName = '',
  options = [],
}) => {
  const [selected, setSelected] = useControllableState(value, defaultValue ?? options?.[0]);
  const translate = useTranslations();

  useEffect(() => {
    setSelected(defaultValue ?? options?.[0]);
  }, [defaultValue, options, setSelected]);

  const handleChange = useCallback(
    (option: Option) => {
      setSelected(option);
      onChange?.(option);
    },
    [onChange, setSelected],
  );

  const buttonClassNames = useCallback(
    (open?: boolean) => {
      return `${error ? 'border-red-500' : 'border-gray-300'}
        relative w-full flex h-10 items-center rounded-sm border py-3 px-4 text-left
        w-full bg-white focus:border-gray-500 focus:ring-0 border  focus:outline-none active:border-gray-400
        ${open ? 'border-gray-400' : ''}
        ${selectButtonClassName}`;
    },
    [selectButtonClassName, error],
  );

  return (
    <>
      {label && (
        <div className="mb-8">
          <label className={labelClassName || 'text-sm font-medium text-gray-600'}>
            {required ? `${label} *` : label}
          </label>
        </div>
      )}
      <Listbox value={selected} onChange={handleChange}>
        {({ open }) => (
          <div className="relative w-full">
            <ListboxButton
              className={buttonClassNames(open)}
              data-test-error={error ? '1' : '0'}
              suppressHydrationWarning
            >
              <span className="text-sm">{selected?.name}</span>
              <span
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4"
                aria-label={translate('common.caret-down')}
              >
                <ChevronDownIcon data-testid="chevron-down-icon" className="size-5 text-gray-600" aria-hidden="true" />
              </span>
            </ListboxButton>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform origin-top scale-y-0"
              enterTo="transform origin-top scale-y-100"
              leave="transition ease-in duration-100"
              leaveFrom="transform origin-top scale-y-150"
              leaveTo="transform origin-top scale-y-0"
            >
              <ListboxOptions className="z-50 mt-1 max-h-25 overflow-y-auto rounded-sm border border-gray-400 bg-white px-1 py-2 focus:outline-none focus:ring-0">
                {options.map((option) => (
                  <ListboxOption
                    key={option.value}
                    className={({ focus }) =>
                      `relative w-full cursor-pointer select-none py-1 pl-2 pr-1 text-sm hover:bg-neutral-200 ${
                        focus ? 'bg-neutral-200' : ''
                      }`
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate text-sm ${selected ? 'font-medium pl-6' : 'font-normal'}`}>
                          {option.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-1">
                            <CheckIcon className="size-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </>
  );
};

export default Select;
