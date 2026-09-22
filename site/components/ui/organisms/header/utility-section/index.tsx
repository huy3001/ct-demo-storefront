import React, { useState } from 'react';
import { useTranslations } from 'use-intl';
import Drawer from '@/components/ui/atoms/drawer';
import { ImageProps } from '@/components/ui/atoms/image';
import { Link } from '@/components/ui/organisms/header/types';
import Slideout, { MenuState } from '@/components/ui/organisms/header/utility-section/components/slide-out';
import CartIcon from '@/components/icons/cart';
import WishlistIcon from '@/components/icons/wishlist';
import CompareHeaderLink from '@/components/compare/CompareHeaderLink';
import AccountButton from './components/account-button';
import type { DiscountCode } from '@commercetools/platform-sdk';

export interface Props {
  isEmpty?: boolean;
  onApplyDiscountCode?: (code: string) => Promise<void>;
  onRemoveDiscountCode?: (discount: DiscountCode) => Promise<void>;
  totalCartItems?: number;
  totalWishlistItems?: number;
  emptyCartTitle: string;
  emptyCartSubtitle: string;
  emptyCartImage: ImageProps;
  emptyCartCategories: Link[];
  emptyWishlistTitle: string;
  emptyWishlistSubtitle: string;
  emptyWishlistImage: ImageProps;
  emptyWishlistCategories: Link[];
}

const UtilitySection: React.FC<Props> = ({
  isEmpty,
  onApplyDiscountCode,
  onRemoveDiscountCode,
  totalCartItems = 0,
  totalWishlistItems = 0,
  emptyCartTitle,
  emptyCartSubtitle,
  emptyCartImage,
  emptyCartCategories,
  emptyWishlistTitle,
  emptyWishlistSubtitle,
  emptyWishlistImage,
  emptyWishlistCategories,
}) => {
  const translate = useTranslations();

  const [menuState, setMenuState] = useState<MenuState>();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const onWishlistClicked = () => {
    setIsDrawerOpen(true);
    setMenuState('wishlist');
  };

  const onCartClicked = () => {
    setIsDrawerOpen(true);
    setMenuState('cart');
  };

  return (
    <div className="mt-3 flex h-10 items-center">
      <div className="flex justify-between gap-x-2 lg:gap-x-4">
        <AccountButton />

        <div className="h-10 w-fit">
          <CompareHeaderLink />
        </div>

        <div className="h-10 w-fit">
          <button
            aria-label={translate('wishlist.my-wishlist')}
            className="relative h-fit cursor-pointer border-gray-600 pb-2 hover:border-b-2"
            onClick={onWishlistClicked}
          >
            <WishlistIcon
              totalWishlistItems={totalWishlistItems}
              className="w-7 text-charcoal"
            />
          </button>
        </div>

        <div className="h-10 w-fit">
          <button
            aria-label={translate('cart.myCart')}
            className="h-fit cursor-pointer border-gray-600 pb-2 hover:border-b-2"
            onClick={onCartClicked}
          >
            <CartIcon
              className="w-7 text-charcoal"
              totalCartItems={totalCartItems}
              counterClassName="-translate-y-1/4"
            />
          </button>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        direction="right"
        className="w-[90%] max-w-95 bg-white"
        onClose={() => setIsDrawerOpen(false)}
      >
        <Slideout
          isEmpty={isEmpty}
          onApplyDiscountCode={onApplyDiscountCode}
          onRemoveDiscountCode={onRemoveDiscountCode}
          state={menuState}
          onClose={() => setIsDrawerOpen(false)}
          changeState={(newState) => setMenuState(newState)}
          emptyCartTitle={emptyCartTitle}
          emptyCartSubtitle={emptyCartSubtitle}
          emptyCartImage={emptyCartImage}
          emptyCartCategories={emptyCartCategories}
          emptyWishlistTitle={emptyWishlistTitle}
          emptyWishlistSubtitle={emptyWishlistSubtitle}
          emptyWishlistImage={emptyWishlistImage}
          emptyWishlistCategories={emptyWishlistCategories}
        />
      </Drawer>
    </div>
  );
};

export default UtilitySection;
