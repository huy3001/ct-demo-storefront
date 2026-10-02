import { cva } from '@/helpers/utils/cva';
import { classnames } from '@/helpers/utils/classnames';
import { DropdownProps } from '../../types';

const useClassNames = ({ disabled, size }: Partial<DropdownProps>) => {
  const intent = disabled ? 'disabled' : 'active';

  const resolveButtonVariant = cva({
    intent: {
      active:
        'cursor-default border-gray-300 bg-white text-gray-600 focus:shadow-200 active:border-gray-400',
      disabled:
        'cursor-not-allowed border-neutral-200 bg-neutral-200 text-neutral-800',
    },
    size: {
      sm: 'h-8',
      lg: 'h-10',
    },
  });

  const buttonClassName = classnames(
    'relative w-full rounded-sm border pl-3 pr-10 text-left text-sm focus:outline-none',
    resolveButtonVariant(`intent.${intent}`) as string,
    resolveButtonVariant(`size.${size}`) as string,
  );

  return { buttonClassName };
};

export default useClassNames;
