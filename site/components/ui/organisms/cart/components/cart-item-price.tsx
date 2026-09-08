import { FC } from 'react';
import { useParams } from 'next/navigation';
// import { useTranslations } from 'use-intl';
import type { LineItem } from '@commercetools/platform-sdk';
import { formatMoney } from '@/lib/utils';

const CartItemPrice: FC<{ item: LineItem }> = ({ item }) => {
  const { locale } = useParams();
  // const translate = useTranslations();

  // if (item.isGift) {
  //   return <p className="text-sm font-normal">{translate('cart.gift')}</p>;
  // }

  return item?.price?.discounted ? (
    <div className="flex items-center gap-1.25">
      <p className="text-sm font-medium leading-loose text-red-500">
        {formatMoney(
          item?.price?.discounted?.value?.centAmount ?? 0,
          item?.price?.discounted?.value?.currencyCode ?? 'USD',
          locale,
        )}
      </p>
      <p className="text-xs font-normal leading-loose text-gray-500 line-through">
        {formatMoney(item?.price?.value?.centAmount ?? 0, item?.price?.value?.currencyCode ?? 'USD', locale)}
      </p>
    </div>
  ) : (
    <p className="text-sm font-medium leading-loose">
      {formatMoney(item?.price?.value?.centAmount ?? 0, item?.price?.value?.currencyCode ?? 'USD', locale)}
    </p>
  );
};

export default CartItemPrice;
