import React from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import { ImageProps } from '@/components/ui/atoms/image';
import WishlistItem from '@/components/ui/molecules/wishlist-item';
import { EmptyState } from '@/components/ui/organisms/empty-state';
import { FooterLink } from '@/components/ui/organisms/footer/atoms/column';
import { useWishlist } from '@/hooks/useWishlist';

export interface WishlistProps {
  emptyWishlistTitle: string;
  emptyWishlistSubtitle: string;
  emptyWishlistImage: ImageProps;
  emptyWishlistCategories: FooterLink[];
  handleCategoryClick?: () => void;
}

const Wishlist: React.FC<WishlistProps> = ({
  emptyWishlistTitle,
  emptyWishlistSubtitle,
  emptyWishlistImage,
  emptyWishlistCategories,
  handleCategoryClick,
}) => {
  const translate = useTranslations();
  const { locale } = useParams();
  const { wishlists, removeFromWishlist, removeAllFromWishlist } = useWishlist();

  const wishlist = wishlists?.[0];

  const handleClearWishlist = async () => {
    if (wishlist?.lineItems?.length) {
      await removeAllFromWishlist(wishlist.id, locale).then(() => {
        toast.success('Wishlist cleared');
      });
    }
  };

  const handleRemoveFromWishlist = async (lineItemId: string) => {
    if (wishlist) {
      await removeFromWishlist(wishlist.id, lineItemId, locale).then(() => {
        toast.success('Item removed from wishlist');
      });
    }
  };

  return (
    <>
      {!wishlist?.lineItems?.length ? (
        <>
          <EmptyState
            title={emptyWishlistTitle}
            subtitle={emptyWishlistSubtitle}
            image={emptyWishlistImage}
            categories={emptyWishlistCategories}
            handleCategoryClick={handleCategoryClick}
          />
        </>
      ) : (
        <>
          <div className="h-[83vh] grow divide-y divide-neutral-400 overflow-auto px-3 md:px-5.5">
            {wishlist?.lineItems?.map((lineItem) => (
              <WishlistItem
                key={lineItem.lineItemId}
                item={lineItem}
                onRemove={async () => handleRemoveFromWishlist(lineItem.lineItemId)}
              />
            ))}
          </div>
          <div className="absolute bottom-0 h-22 w-full p-5">
            <Button
              onClick={handleClearWishlist}
              variant="secondary"
              className="w-full text-base"
            >
              {translate('wishlist.wishlist-clear-list')}
            </Button>
          </div>
        </>
      )}
    </>
  );
};
export default Wishlist;
