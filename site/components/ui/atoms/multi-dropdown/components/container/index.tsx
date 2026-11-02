import React from 'react';
import { classnames } from '@/helpers/utils/classnames';
import { Listbox } from '@headlessui/react';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { useDropdown } from '../../context';

const DropdownContainer = ({ children }: React.PropsWithChildren) => {
  const { handleChange, className, value, disabled, defaultValue, onCollapse } = useDropdown();

  const ref = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, onCollapse);

  return (
    <div ref={ref} className={classnames('relative', className)}>
      <Listbox value={value ?? []} defaultValue={defaultValue} onChange={handleChange} disabled={disabled} multiple>
        {children}
      </Listbox>
    </div>
  );
};

export default DropdownContainer;
