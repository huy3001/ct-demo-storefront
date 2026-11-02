import React, { useCallback, useRef, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import useClassNames from '@/hooks/useClassNames';
import useControllableState from '@/hooks/useControllableState';
import useMediaQuery from '@/hooks/useMediaQuery';
import { desktop } from '@/helpers/utils/screensizes';

export interface CheckboxProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'key'> {
  label?: string;
  labelPosition?: 'on-left' | 'on-right';
  containerClassName?: string;
  onChange?: (props: { name: string; checked: boolean }) => void;
  disableBackground?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  className = '',
  checked,
  onChange,
  onMouseOver,
  onMouseLeave,
  containerClassName,
  label,
  defaultChecked = false,
  labelPosition = 'on-right',
  disableBackground = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isChecked, setIsChecked] = useControllableState(checked, defaultChecked);

  const [isDesktopSize] = useMediaQuery(desktop);

  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (!isDesktopSize) {
      toggleIsChecked();
    }
  };

  const toggleIsChecked = useCallback(() => {
    onChange?.({ name: props.name ?? '', checked: !isChecked });

    setIsChecked(!isChecked);
  }, [isChecked, onChange, props.name, setIsChecked]);

  const handleMouseOver = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsHovered(isDesktopSize);
    onMouseOver?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  const containerClassNames = useClassNames(['flex items-center gap-3', containerClassName]);
  const buttonClassName = useClassNames([
    'h-5 w-5 min-w-5 rounded-sm relative cursor-pointer ',
    isHovered ? 'outline-gray-600' : 'outline-neutral-400',
  ]);

  const inputClassName = useClassNames([
    'absolute w-full h-full z-[2] accent-charcoal cursor-pointer checked:bg-none bg-transparent focus:border-gray-600 rounded-sm text-transparent border-neutral-400',
    className,
  ]);

  const iconClassName = useClassNames([
    'absolute top-[50%] z-[1] left-[50%] h-4 w-4 translate-y-[-50%] translate-x-[-50%] stroke-[2px]',
    isChecked || isHovered ? 'block' : 'hidden',
    isChecked && !disableBackground ? 'text-white' : 'text-charcoal',
  ]);

  const backgroundClassName = useClassNames(['absolute z-0 h-5 w-5 rounded-sm', { 'bg-gray-600': !!isChecked }]);

  const LabelElement = (
    <span id="input-label" className="text-sm text-charcoal">
      {label}
    </span>
  );

  return (
    <label className={containerClassNames} onClick={handleContainerClick}>
      {label && labelPosition === 'on-left' && LabelElement}

      <span className={buttonClassName}>
        <input
          ref={checkboxRef}
          type="checkbox"
          aria-labelledby="input-label"
          checked={isChecked}
          className={inputClassName}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onChange={toggleIsChecked}
          {...props}
        />

        <CheckIcon className={iconClassName} />

        {!disableBackground && <div className={backgroundClassName} />}
      </span>

      {label && labelPosition === 'on-right' && LabelElement}
    </label>
  );
};

export default Checkbox;
