import React, { FC } from 'react';
import { useParams } from 'next/navigation';
import useClassNames from '@/hooks/useClassNames';
import useCostsData from '../hooks/useCostsData';
import { CostsProps } from '../types';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';

const Costs: FC<CostsProps> = ({
  className,
  order,
  dataReference = 'cart',
  subCostsContainerClassName,
  subCostClassName,
  totalAmountClassName,
}) => {
  const { locale } = useParams();
  const { cart } = useCart();
  const { costsToRender, total } = useCostsData({ dataReference, order });

  const totalAmountClassNames = useClassNames([
    'mt-6 flex items-center justify-between font-medium',
    totalAmountClassName,
  ]);

  const subCostsContainerClassNames = useClassNames(['grid gap-2', subCostsContainerClassName]);
  const subCostsClassNames = useClassNames([
    'flex items-center justify-between capitalize text-gray-600 text-sm',
    subCostClassName,
  ]);

  return (
    <div className={className}>
      <div className={subCostsContainerClassNames}>
        {costsToRender.map(
          ({ key, label, value }) =>
            !!value?.centAmount &&
            value.centAmount > 0 && (
              <div
                key={key}
                className={subCostsClassNames}
              >
                <p>{label}</p>
                <p>
                  {key === 'discount' && '-'}
                  {formatMoney(
                    value.centAmount ?? 0,
                    value.currencyCode ?? 'USD',
                    locale,
                  )}
                </p>
              </div>
            ),
        )}
      </div>
      <div className={totalAmountClassNames}>
        <p>{total.label}</p>
        <p>
          {cart?.totalPrice
            ? formatMoney(
                cart.totalPrice.centAmount,
                cart.totalPrice.currencyCode,
                locale,
              )
            : formatMoney(
                total.value.centAmount ?? 0,
                total.value.currencyCode ?? 'USD',
                locale,
              )}
        </p>
      </div>
    </div>
  );
};

export default Costs;
