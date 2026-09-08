import React, { FC } from 'react';
// import { useParams } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Image from '@/components/ui/atoms/image';
// import { formatMoney } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import type { WishlistItem } from '@/lib/types';

export interface WishlistItemProps {
  item: WishlistItem;
  onRemove?: () => Promise<void>;
}

const WishlistItem: FC<WishlistItemProps> = ({ item, onRemove }) => {
  // const { locale } = useParams();
  const { addItem } = useCart();

  const translate = useTranslations();

  // const currencyCode = item?.price?.currencyCode ?? 'USD';

  const handleMoveToCart = async () => {
    await addItem(item.productId, item?.variantId ?? 1, item.quantity);
  };

  return (
    <div className="flex max-w-full items-stretch justify-start gap-2.5 py-4.5 md:gap-3.75">
      <div className="h-30 w-30 shrink-0 bg-white p-3">
        <div className="relative h-full w-full">
          <Image
            src={item?.image}
            suffix="small"
            style={{ objectFit: 'contain' }}
            alt={item.name ?? ''}
            fill
          />
        </div>
      </div>
      <div className="grow">
        <div className="flex max-w-full items-center justify-between">
          <p className="max-w-40 overflow-hidden text-ellipsis whitespace-pre text-sm uppercase leading-loose">
            {item.name}
          </p>
          <i
            onClick={onRemove}
            className="block cursor-pointer"
            data-testid="remove-button"
          >
            <TrashIcon
              stroke="#494949"
              className="w-5"
            />
          </i>
        </div>
        {/* <div className="mt-3">
          {item?.price?.discounted ? (
            <div className="flex items-center gap-1.25">
              <span className="text-sm font-medium leading-loose text-red-500">
                {formatMoney(
                  item?.price?.discounted?.centAmount ?? 0,
                  currencyCode,
                  locale,
                )}
              </span>
              <span className="text-xs font-normal leading-loose text-gray-500 line-through">
                {formatMoney(
                  item?.price?.centAmount ?? 0,
                  currencyCode,
                  locale,
                )}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium leading-loose">
              {formatMoney(item?.price?.centAmount ?? 0, currencyCode, locale)}
            </span>
          )}
        </div> */}
        <div className="mt-4 leading-normal">
          <Button
            size="xs"
            variant="primary"
            onClick={handleMoveToCart}
            disabled={item.quantity === 0}
          >
            {translate('wishlist.wishlist-add-to-cart')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
