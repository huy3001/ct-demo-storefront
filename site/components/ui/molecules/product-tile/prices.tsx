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
        <div className="flex items-center gap-8">
          <p className="text-11 font-medium leading-loose text-red-500 md:text-14">
            {formatMoney(
              discountedPrice?.centAmount ?? 0,
              discountedPrice?.currencyCode ?? 'USD',
              locale,
            )}
          </p>
          <p className="text-10 font-medium leading-loose text-gray-500 line-through md:text-12">
            {formatMoney(
              price?.centAmount ?? 0,
              price?.currencyCode ?? 'USD',
              locale,
            )}
          </p>
        </div>
      ) : (
        <p className="text-11 font-medium leading-loose text-primary md:text-14">
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
