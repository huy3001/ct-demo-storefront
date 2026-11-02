import React from 'react';
import { useTranslations } from 'use-intl';
import useClassNames from '@/hooks/useClassNames';

interface Props {
  className?: string;
}

const OutOfStock: React.FC<React.PropsWithChildren<Props>> = ({ className }) => {
  const translate = useTranslations();

  const classNames = useClassNames([
    'flex h-6.25 w-fit items-center justify-center py-1 px-2 text-xs bg-red-500 text-white',
    className,
  ]);

  return <span className={classNames}>{translate('product.sold-out')}</span>;
};

export default OutOfStock;
