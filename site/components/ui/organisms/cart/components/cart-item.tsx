import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Image from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import OutOfStock from '@/components/ui/atoms/out-of-stock';
import QuantitySelector from '@/components/ui/atoms/quantity-selector';
import useClassNames from '@/hooks/useClassNames';
import CartItemPrice from './cart-item-price';
import Button from '@/components/ui/atoms/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { getLocalizedString } from '@/lib/utils';
import type { LineItem as CartLineItem } from '@commercetools/platform-sdk';

interface ClassNames {
  moveToWishlist?: string;
}

interface CartItemProps {
  item: CartLineItem;
  classNames?: ClassNames;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  classNames = {},
}) => {
  const translate = useTranslations();
  const { locale } = useParams();
  const { changeQuantity, removeItem } = useCart();
  const { addToWishlist } = useWishlist();

  const [processing, setProcessing] = useState(false);

  const deleteButtonClassName = useClassNames([
    'inline-block',
    processing ? 'cursor-not-allowed' : 'cursor-pointer',
  ]);

  const wishlistButtonClassName = useClassNames([
    'text-gray-600 decoration-gray-600 decoration-solid text-xs! p-0! hover:underline hover:underline-offset-2',
    classNames.moveToWishlist,
    processing ? 'cursor-not-allowed' : 'cursor-pointer',
  ]);

  const handleUpdateItem = useCallback(
    async (quantity: number) => {
      if (processing) return;

      setProcessing(true);

      await (
        quantity < 1 ? removeItem(item.id) : changeQuantity(item.id, quantity)
      ).then(() => {
        toast.success('Item updated in cart');
      });

      setProcessing(false);
    },
    [changeQuantity, item.id, processing, removeItem],
  );

  const handleRemoveItem = useCallback(async () => {
    if (processing) return;

    setProcessing(true);
    await removeItem(item.id).then(() => {
      toast.success('Item removed from cart');
    });
    setProcessing(false);
  }, [removeItem, item.id, processing]);

  const handleMoveToWishlist = useCallback(async () => {
    if (processing) return;

    setProcessing(true);
    await addToWishlist(item.productId, item.variant.id, locale).then(() => {
      toast.success('Item moved to wishlist');
    });
    setProcessing(false);
  }, [addToWishlist, item.productId, item.variant.id, locale, processing]);

  const image = item.variant.images?.[0]?.url;
  const name = getLocalizedString(item.name, locale);
  const slug = getLocalizedString(item.productSlug, locale);

  const url = `/product/${slug}`;

  const channels = Object.values(item.variant?.availability?.channels ?? {});

  const isOutOfStock = channels?.every(
    (channel) => channel.isOnStock === false,
  );

  return (
    <div className="flex max-w-full items-stretch justify-start gap-2.5 py-4.5 md:gap-3.75">
      <div className="h-30 w-30 shrink-0 bg-white p-3">
        <Link
          title={name}
          className="relative block size-full rounded-sm"
          link={url}
        >
          <Image
            alt={name}
            src={image}
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
            title={name}
            link={url}
          >
            {name}
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
        {isOutOfStock && (
          <div className="mt-2">
            <OutOfStock />
          </div>
        )}
        <div className="mt-2">
          <CartItemPrice item={item} />
        </div>
        <div className="mt-4">
          <QuantitySelector
            value={item.quantity}
            defaultValue={1}
            minValue={0}
            maxValue={item.variant?.availability?.availableQuantity}
            disabled={processing}
            onChange={handleUpdateItem}
          />
        </div>
        <div className="mt-4">
          <Button
            size="xs"
            variant="underlined"
            className={wishlistButtonClassName}
            onClick={handleMoveToWishlist}
          >
            {translate('cart.move-to-wishlist')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
