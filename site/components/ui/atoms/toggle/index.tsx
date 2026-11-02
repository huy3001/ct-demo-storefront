import { useCallback } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useControllableState from '@/hooks/useControllableState';
import { classnames } from '@/helpers/utils/classnames';
import { ToggleProps } from './types';

const Toggle = ({ label, checked: checkedProp, defaultChecked = false, onChange }: ToggleProps) => {
  const [checked, setChecked] = useControllableState(checkedProp, defaultChecked);

  const handleChange = useCallback(
    (checkedVal: boolean) => {
      setChecked(checkedVal);
      onChange?.(checkedVal);
    },
    [setChecked, onChange],
  );

  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-3">
      {label && (
        <div className="font-medium text-sm text-gray-600">{label}</div>
      )}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => handleChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={classnames(
            'block h-8 w-14 rounded-full border border-gray-300',
            checked ? 'bg-charcoal' : 'bg-white',
          )}
        ></div>
        <div
          className={classnames(
            'absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-neutral-100 transition',
            { 'translate-x-full': checked },
          )}
        >
          <span
            data-testid="checked-icon"
            className={!checked ? 'hidden' : 'block'}
          >
            <CheckIcon className="size-4 stroke-charcoal" />
          </span>
          <span
            data-testid="unchecked-icon"
            className={checked ? 'hidden' : 'block'}
          >
            <XMarkIcon className="size-4 stroke-charcoal" />
          </span>
        </div>
      </div>
    </label>
  );
};

export default Toggle;
