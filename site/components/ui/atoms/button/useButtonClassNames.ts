import useClassNames from '@/hooks/useClassNames';
import { ButtonProps, ButtonSize, ButtonVariant } from '.';

type variantBasedClassName = { [key in ButtonVariant]?: string };
type IncludesIcon = { includesIcon: boolean };
type UseButtonClassNames = (
  props: Pick<ButtonProps, 'variant' | 'size' | 'className' | 'loading' | 'asSkeleton'> & IncludesIcon,
) => string;

const useButtonClassNames: UseButtonClassNames = ({
  variant,
  size,
  className = '',
  includesIcon,
  loading,
  asSkeleton = false,
}) => {
  const sizeClassNames: { [key in ButtonSize]: string } = {
    xs: 'p-2',
    s: 'py-3 px-6',
    m: 'py-3 px-9',
    l: 'py-3 px-12',
    fit: 'p-0',
    full: 'py-3 w-full',
    icon: 'w-10 h-10 grid items-center justify-center',
  };

  const primaryClassName = useClassNames([
    'bg-charcoal text-white outline-offset-0',
    'hover:bg-charcoal-light',
    'active:shadow-button active:disabled:shadow-none active:bg-charcoal-light',
    'focus-visible:outline focus-visible:outline-charcoal border-charcoal focus-visible:border focus-visible:outline-offset-[3px]',
    'disabled:bg-neutral-300 disabled:text-gray-400 disabled:border-neutral-300 disabled:pointer-events-none',
  ]);

  const secondaryClassName = useClassNames([
    'bg-white-100 text-charcoal bg-white rounded-sm border border-charcoal-light',
    'hover:bg-cream-dark hover:shadow-bottom',
    'active:outline-2 active:shadow-button active:disabled:shadow-none active:outline-1 active:outline-gray-300 active:outline-offset-0',
    'focus-visible:outline focus-visible:border-white-100 focus-visible:border focus-visible:outline-offset-[3px]',
    'disabled:text-gray-400 disabled:pointer-events-none',
  ]);

  const warningClassName = useClassNames([
    'bg-red-500 text-white outline-offset-0',
    'hover:bg-red-600',
    'active:shadow-button active:disabled:shadow-none active:bg-red-500',
    'focus-visible:outline focus-visible:bg-red-700 focus-visible:outline-charcoal focus-visible:border-red-700 focus-visible:border focus-visible:outline-offset-[3px]',
    'disabled:bg-neutral-300 disabled:text-gray-400 disabled:pointer-events-none',
  ]);

  const underlineClassName = 'pb-2 text-charcoal hover:underline disabled:text-gray-400';

  const ghostClassName = 'disabled:text-gray-400';

  const variantClassNames: variantBasedClassName = {
    primary: primaryClassName,
    secondary: secondaryClassName,
    underlined: underlineClassName,
    ghost: ghostClassName,
    warning: warningClassName,
  };

  return useClassNames([
    sizeClassNames[size as ButtonSize],
    { 'rounded-sm': variant !== 'ghost' },
    { 'flex gap-2 items-center': includesIcon },
    { 'cursor-not-allowed': !!loading },
    'relative text-sm transition overflow-hidden font-medium leading-4',
    asSkeleton ? 'relative' : (variantClassNames[variant as ButtonVariant] as string),
    className,
  ]);
};

export default useButtonClassNames;
