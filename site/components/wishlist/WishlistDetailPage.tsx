'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'use-intl';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/atoms/button';
import Skeleton from '@/components/ui/atoms/skeleton';
import type { Product } from '@/lib/types';

export default function WishlistDetailPage({
  locale,
  wishlistId,
}: {
  locale: string;
  wishlistId: string;
}) {
  const translate = useTranslations();
  const { wishlists, isLoading, removeAllFromWishlist } = useWishlist();
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wishlist = useMemo(
    () => wishlists.find((item) => item.id === wishlistId),
    [wishlists, wishlistId],
  );

  if (isLoading) {
    return <Skeleton className="h-5 w-full" />;
  }

  if (!wishlist) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">
          {translate('wishlist.not-found')}
        </h1>
        <Link
          href="/account/wishlists"
          locale={locale}
          className="mt-4 inline-block text-terra hover:underline"
        >
          {translate('wishlist.back')}
        </Link>
      </div>
    );
  }

  const resolvedWishlistId = wishlist.id;

  async function onRemoveAll() {
    if (!window.confirm(translate('wishlist.remove-all-confirm'))) return;

    setIsRemovingAll(true);
    setError(null);
    try {
      await removeAllFromWishlist(resolvedWishlistId, locale);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : translate('wishlist.wishlist-remove-all-failed'),
      );
    } finally {
      setIsRemovingAll(false);
    }
  }

  const products: Product[] = wishlist.lineItems.map((item) => ({
    type: 'Product',
    id: item.productId,
    name: item.name,
    slug: item.slug ?? item.productId,
    categories: [],
    reviews: [],
    variants:
      item.variantId === undefined
        ? []
        : [
            {
              id: item.variantId,
              sku: '',
              images: item.image ? [item.image] : [],
              price: item.price,
              prices: item.price ? [item.price] : [],
              attributes: [],
            },
          ],
  }));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">
            {wishlist.name}
          </h1>
          <p className="text-sm text-charcoal-light">
            {wishlist.lineItems.length} {translate('wishlist.saved-items')}
          </p>
        </div>
        <Link
          href="/account/wishlists"
          locale={locale}
          className="text-sm text-terra hover:underline"
        >
          {translate('wishlist.back')}
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {wishlist.lineItems.length === 0 ? (
        <p className="text-charcoal-light text-sm">
          {translate('wishlist.wishlist-empty')}.
        </p>
      ) : (
        <ProductGrid
          products={products}
          locale={locale}
          showWishlistSelector={false}
        />
      )}

      <div className="mt-8 flex items-center gap-2">
        {wishlist.lineItems.length > 0 && (
          <Button
            onClick={onRemoveAll}
            disabled={isRemovingAll}
            variant="secondary"
          >
            {isRemovingAll
              ? translate('wishlist.removing')
              : translate('wishlist.remove-all-products')}
          </Button>
        )}
      </div>
    </div>
  );
}
