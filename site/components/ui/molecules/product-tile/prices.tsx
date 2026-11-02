'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Money } from '@/types/entity/product';
import { formatMoney } from '@/lib/utils';
import type { Price } from '@/lib/types';

interface Props {
  discountedPrice?: Price['discounted'];
  price?: Money;
}

const Prices: React.FC<Props> = ({ price, discountedPrice }) => {
  const { locale } = useParams();

  return (
    <>
      {discountedPrice ? (
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium leading-loose text-red-500 md:text-sm">
            {formatMoney(
              discountedPrice?.centAmount ?? 0,
              discountedPrice?.currencyCode ?? 'USD',
              locale,
            )}
          </p>
          <p className="text-xxs font-medium leading-loose text-gray-500 line-through md:text-xs">
            {formatMoney(
              price?.centAmount ?? 0,
              price?.currencyCode ?? 'USD',
              locale,
            )}
          </p>
        </div>
      ) : (
        <p className="text-xs font-medium leading-loose text-primary md:text-sm">
          {formatMoney(
            price?.centAmount ?? 0,
            price?.currencyCode ?? 'USD',
            locale,
          )}
        </p>
      )}
    </>
  );
};

export default Prices;
