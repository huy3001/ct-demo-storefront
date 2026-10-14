import { cva } from '@/helpers/utils/cva';
import { classnames } from '@/helpers/utils/classnames';
import { TextAreaProps, TextAreaVariant } from '../../types';

const useClassNames = (variant: TextAreaVariant, { fitContent }: Partial<TextAreaProps>) => {
  const resolveVariant = cva({
    default:
      'border-gray-300 text-charcoal focus:border-gray-400 active:border-gray-400 placeholder:text-gray-600',
    disabled:
      'cursor-not-allowed border-neutral-300 bg-neutral-300 text-gray-400 focus:border-neutral-300',
    readOnly:
      'cursor-default border-neutral-300 bg-neutral-300 text-charcoal focus:border-neutral-300 active:border-gray-400',
    error:
      'border-red-500 text-charcoal focus:border-red-500 active:border-red-500',
    valid:
      'border-green-500 text-charcoal focus:border-green-500 active:border-green-500',
  });

  const textAreaClassName = classnames(
    'flex w-full resize-none rounded-sm border px-3 py-2.5 text-sm focus:outline-none focus:ring-0',
    resolveVariant(variant) as string,
    {
      'overflow-hidden': fitContent,
    },
  );

  return { textAreaClassName };
};

export default useClassNames;
