'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';

export default function WishlistDetailPage({ locale, wishlistId }: { locale: string; wishlistId: string }) {
  const { wishlists, isLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wishlist = useMemo(() => wishlists.find((item) => item.id === wishlistId), [wishlists, wishlistId]);

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-charcoal-light">Loading wishlist…</div>;
  }

  if (!wishlist) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-charcoal">Wishlist not found</h1>
        <Link href="/wishlists" locale={locale} className="mt-4 inline-block text-terra hover:underline">
          Back to wishlists
        </Link>
      </div>
    );
  }

  async function onRemove(lineItemId: string) {
    setBusyItemId(lineItemId);
    setError(null);
    try {
      await removeFromWishlist(wishlist.id, lineItemId, locale);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setBusyItemId(null);
    }
  }

  async function onAddToCart(productId: string, variantId: number) {
    setBusyItemId(`${productId}-${variantId}`);
    setError(null);
    try {
      await addItem(productId, variantId, 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">{wishlist.name}</h1>
          <p className="text-sm text-charcoal-light">{wishlist.lineItems.length} saved items</p>
        </div>
        <Link href="/wishlists" locale={locale} className="text-sm text-terra hover:underline">
          Back to wishlists
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {wishlist.lineItems.length === 0 ? (
        <p className="text-charcoal-light">This wishlist is empty.</p>
      ) : (
        <div className="space-y-4">
          {wishlist.lineItems.map((item) => (
            <div key={item.lineItemId} className="grid grid-cols-[88px_1fr] gap-4 rounded-sm border border-border bg-white p-4 md:grid-cols-[88px_1fr_auto] md:items-center">
              <div className="relative h-[88px] w-[88px] overflow-hidden rounded-sm bg-cream-dark">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="88px" className="object-cover" />
                ) : null}
              </div>
              <div>
                <Link href={item.slug ? `/product/${item.slug}` : '/'} locale={locale} className="font-medium text-charcoal hover:text-terra">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-charcoal-light">Qty: {item.quantity}</p>
                {item.price && (
                  <p className="mt-1 text-sm text-charcoal">
                    {formatMoney(item.price.centAmount, item.price.currencyCode, locale)}
                  </p>
                )}
              </div>
              <div className="mt-3 flex gap-2 md:mt-0">
                <button
                  type="button"
                  onClick={() => onAddToCart(item.productId, item.variantId)}
                  disabled={busyItemId === `${item.productId}-${item.variantId}`}
                  className="rounded-sm border border-charcoal px-3 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-white disabled:opacity-60"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.lineItemId)}
                  disabled={busyItemId === item.lineItemId}
                  className="rounded-sm border border-border px-3 py-2 text-sm text-charcoal-light hover:text-red-600 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
