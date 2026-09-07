import React, { useCallback, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { LineItem as CartLineItem } from '@/types/cart/LineItem';
import { useTranslations } from 'use-intl';
import Image from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import OutOfStock from '@/components/ui/atoms/out-of-stock';
import QuantitySelector from '@/components/ui/atoms/quantity-selector';
import useClassNames from '@/hooks/useClassNames';
import CartItemPrice from './cart-item-price';

interface ClassNames {
  moveToWishlist?: string;
}

interface Props {
  item: CartLineItem;
  classNames?: ClassNames;
  onRemoveItem(): Promise<void>;
  onUpdateItem(quantity: number): Promise<void>;
  OnMoveToWishlist(): Promise<void>;
}

const CartItem: React.FC<Props> = ({ item, onRemoveItem, onUpdateItem, OnMoveToWishlist, classNames = {} }) => {
  const translate = useTranslations();

  const [processing, setProcessing] = useState(false);

  const deleteButtonClassName = useClassNames(['inline-block', processing ? 'cursor-not-allowed' : 'cursor-pointer']);

  const wishlistButtonClassName = useClassNames([
    'text-gray-600 decoration-gray-600 decoration-solid hover:underline hover:underline-offset-2',
    classNames.moveToWishlist,
    processing ? 'cursor-not-allowed' : 'cursor-pointer',
  ]);

  const handleUpdateItem = useCallback(
    async (quantity: number) => {
      if (processing) return;

      setProcessing(true);

      await (quantity < 1 ? onRemoveItem() : onUpdateItem(quantity));

      setProcessing(false);
    },
    [onUpdateItem, onRemoveItem, processing],
  );

  const handleRemoveItem = useCallback(async () => {
    if (processing) return;

    setProcessing(true);
    await onRemoveItem();
    setProcessing(false);
  }, [onRemoveItem, processing]);

  const handleMoveToWishlist = useCallback(async () => {
    if (processing) return;

    setProcessing(true);
    await OnMoveToWishlist();
    setProcessing(false);
  }, [OnMoveToWishlist, processing]);

  return (
    <div className="flex max-w-full items-stretch justify-start gap-2.5 py-4.5 md:gap-3.75">
      <div className="w-31.25 shrink-0 bg-white p-3">
        <Link
          title={item.name}
          className="relative block size-full rounded-sm"
          link={item._url}
        >
          <Image
            alt={item.name}
            src={item.variant?.images?.[0]}
            suffix="small"
            style={{ objectFit: 'contain' }}
            fill
          />
        </Link>
      </div>
      <div className="max-w-full grow overflow-hidden">
        <div className="flex items-center justify-between">
          <Link
            className="block max-w-[85%] overflow-hidden text-ellipsis whitespace-pre text-sm uppercase leading-loose"
            title={item.name}
            link={item._url}
          >
            {item.name}
          </Link>
          <button
            data-testid="remove-button"
            onClick={handleRemoveItem}
            className={deleteButtonClassName}
            disabled={processing}
            aria-label={translate('common.delete')}
          >
            <TrashIcon
              stroke="#494949"
              className="w-5"
            />
          </button>
        </div>
        {!item.variant?.isOnStock && (
          <div className="mt-2">
            <OutOfStock />
          </div>
        )}
        <div className="mt-2">
          <CartItemPrice item={item} />
        </div>
        <div className="mt-4">
          <QuantitySelector
            value={item.count}
            defaultValue={1}
            minValue={0}
            maxValue={item.variant?.availableQuantity}
            disabled={processing}
            onChange={handleUpdateItem}
          />
        </div>
        <div className="mt-4 text-xs">
          <p
            className={wishlistButtonClassName}
            onClick={handleMoveToWishlist}
          >
            {translate('cart.move-to-wishlist')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
