import { FC } from 'react';
import { useParams } from 'next/navigation';
import { LineItem } from '@/types/cart';
import { useTranslations } from 'use-intl';
import { CurrencyHelpers } from '@/helpers/currencyHelpers';

const CartItemPrice: FC<{ item: LineItem }> = ({ item }) => {
  const { locale } = useParams();
  const translate = useTranslations();

  if (item.isGift) {
    return <p className="text-sm font-normal">{translate('cart.gift')}</p>;
  }

  return item.discountedPrice ? (
    <div className="flex items-center gap-1.25">
      <p className="text-sm font-medium leading-loose text-red-500">
        {CurrencyHelpers.formatForCurrency(item.discountedPrice?.value ?? 0, locale)}
      </p>
      <p className="text-xs font-normal leading-loose text-gray-500 line-through">
        {CurrencyHelpers.formatForCurrency(item.price ?? 0, locale)}
      </p>
    </div>
  ) : (
    <p className="text-sm font-medium leading-loose">{CurrencyHelpers.formatForCurrency(item.price ?? 0, locale)}</p>
  );
};

export default CartItemPrice;
