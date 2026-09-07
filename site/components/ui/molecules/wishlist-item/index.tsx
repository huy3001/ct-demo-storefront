import React, { FC } from 'react';
import { useParams } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { LineItem } from '@/types/wishlist/LineItem';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Image from '@/components/ui/atoms/image';
import { CurrencyHelpers } from '@/helpers/currencyHelpers';

export interface WishlistItemProps {
  item: LineItem;
  onRemove?: () => Promise<void>;
  onMoveToCart?: () => Promise<void>;
}

const WishlistItem: FC<WishlistItemProps> = ({ item, onRemove, onMoveToCart }) => {
  const { locale } = useParams();

  const translate = useTranslations();

  return (
    <div className="flex max-w-full items-stretch justify-start gap-2.5 py-4.5 md:gap-3.75">
      <div className="h-36.25 w-31.25 shrink-0 bg-white p-3">
        <div className="relative size-full">
          <Image
            src={item.variant?.images?.[0]}
            suffix="small"
            style={{ objectFit: 'contain' }}
            alt={item.name ?? ''}
            fill
          />
        </div>
      </div>
      <div className="grow">
        <div className="flex max-w-full items-center justify-between">
          <p className="max-w-37.5 overflow-hidden text-ellipsis whitespace-pre text-sm uppercase leading-loose">
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
        <div className="mt-3">
          {item.variant?.discountedPrice ? (
            <div className="flex items-center gap-1.25">
              <span className="text-sm font-medium leading-loose text-red-500">
                {CurrencyHelpers.formatForCurrency(
                  item.variant?.discountedPrice?.value ?? 0,
                  locale,
                )}
              </span>
              <span className="text-xs font-normal leading-loose text-gray-500 line-through">
                {CurrencyHelpers.formatForCurrency(
                  item.variant?.price ?? 0,
                  locale,
                )}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium leading-loose">
              {CurrencyHelpers.formatForCurrency(
                item.variant?.price ?? 0,
                locale,
              )}
            </span>
          )}
        </div>
        <div className="mt-4 leading-normal">
          <Button
            variant="primary"
            onClick={onMoveToCart}
            disabled={!item.variant?.isOnStock}
            className="py-2 text-sm"
          >
            {translate('wishlist.wishlist-add-to-cart')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
