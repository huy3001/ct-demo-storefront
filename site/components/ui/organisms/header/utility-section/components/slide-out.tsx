import React, { useMemo } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import CloseIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useTranslations } from 'use-intl';
import { ImageProps } from '@/components/ui/atoms/image';
import Cart from '@/components/ui/organisms/cart-slideout';
import { Link } from '@/components/ui/organisms/header/types';
import Wishlist from '@/components/ui/organisms/wishlist';
import CartIcon from '@/components/icons/cart';
import useClassNames from '@/hooks/useClassNames';
import type { DiscountCode } from '@commercetools/platform-sdk';

export type MenuState = 'wishlist' | 'cart';

export interface SlideOutProps {
  isEmpty?: boolean;
  onRemoveDiscountCode?: (discount: DiscountCode) => Promise<void>;
  totalCartItems?: number;
  totalWishlistItems?: number;
  state?: MenuState;
  changeState?: (newState?: MenuState) => void;
  onClose?: () => void;
  emptyCartTitle: string;
  emptyCartSubtitle: string;
  emptyCartImage: ImageProps;
  emptyCartCategories: Link[];
  emptyWishlistTitle: string;
  emptyWishlistSubtitle: string;
  emptyWishlistImage: ImageProps;
  emptyWishlistCategories: Link[];
  enableCartState?: boolean;
  enableWishlistState?: boolean;
}

const Slideout: React.FC<SlideOutProps> = ({
  isEmpty,
  totalCartItems = 0,
  onRemoveDiscountCode,
  totalWishlistItems = 0,
  state,
  changeState,
  onClose,
  emptyCartTitle,
  emptyCartSubtitle,
  emptyCartImage,
  emptyCartCategories,
  emptyWishlistTitle,
  emptyWishlistSubtitle,
  emptyWishlistImage,
  emptyWishlistCategories,
  enableCartState = true,
  enableWishlistState = true,
}) => {
  const translate = useTranslations();

  const title = useMemo(() => {
    switch (state) {
      case 'cart':
        return translate('cart.myCart');
      case 'wishlist':
        return translate('wishlist.my-wishlist');
    }
  }, [translate, state]);

  const iconClassName =
    'absolute -bottom-5.75 left-1/2 -translate-x-1/2 h-0.5 w-[130%] transition duration-200';

  const wishlistClassName = useClassNames([
    iconClassName,
    state === 'wishlist' ? 'bg-charcoal ease-out' : 'bg-transparent ease-in',
  ]);

  const cartClassName = useClassNames([
    iconClassName,
    state === 'cart' ? 'bg-charcoal ease-out' : 'bg-transparent ease-in',
  ]);

  const ActiveSection = useMemo(
    () =>
      ({
        cart: (
          <Cart
            isEmpty={isEmpty}
            onRemoveDiscountCode={onRemoveDiscountCode}
            emptyStateImage={emptyCartImage}
            emptyStateTitle={emptyCartTitle}
            emptyStateSubtitle={emptyCartSubtitle}
            emptyStateCategories={emptyCartCategories}
            handleCategoryClick={onClose}
          />
        ),
        wishlist: (
          <Wishlist
            emptyWishlistTitle={emptyWishlistTitle}
            emptyWishlistSubtitle={emptyWishlistSubtitle}
            emptyWishlistImage={emptyWishlistImage}
            emptyWishlistCategories={emptyWishlistCategories}
            handleCategoryClick={onClose}
          />
        ),
      })[state as MenuState] ?? <></>,
    [
      isEmpty,
      onRemoveDiscountCode,
      emptyCartCategories,
      emptyCartImage,
      emptyCartSubtitle,
      emptyCartTitle,
      emptyWishlistCategories,
      emptyWishlistImage,
      emptyWishlistSubtitle,
      emptyWishlistTitle,
      onClose,
      state,
    ],
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-neutral-400 py-6 pb-5.5 px-4 md:px-5">
        <h3 className="text-lg font-medium leading-normal md:text-xl">
          {title}
        </h3>
        <div className="flex h-full items-center gap-6">
          {enableWishlistState && (
            <button
              className="relative h-full cursor-pointer transition hover:opacity-80"
              onClick={() => changeState?.('wishlist')}
              aria-label={translate('wishlist.wishlist')}
            >
              <div className={wishlistClassName} />
              {totalWishlistItems > 0 && (
                <span className="absolute -right-2 -top-1 size-2.5 rounded-full bg-green-500" />
              )}
              <HeartIcon
                className="w-7"
                stroke="#494949"
              />
            </button>
          )}
          {enableCartState && (
            <button
              className="relative h-full cursor-pointer transition hover:opacity-80"
              onClick={() => changeState?.('cart')}
              aria-label={translate('cart.myCart')}
            >
              <div className={cartClassName} />
              <div className="relative">
                <CartIcon
                  className="w-7"
                  totalCartItems={totalCartItems}
                  counterClassName="-translate-y-1/4"
                />
              </div>
            </button>
          )}
          <button
            onClick={onClose}
            className="cursor-pointer transition hover:opacity-80"
            data-testid="close-icon"
            aria-label={translate('common.close')}
          >
            <CloseIcon
              className="w-7"
              stroke="#494949"
            />
          </button>
        </div>
      </div>
      {ActiveSection}
    </>
  );
};

export default Slideout;
