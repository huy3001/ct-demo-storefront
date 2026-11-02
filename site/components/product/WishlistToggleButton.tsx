'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount } from '@/hooks/useAccount';
import { useWishlist } from '@/hooks/useWishlist';

export default function WishlistToggleButton({
  productId,
  variantId,
  locale,
  className = '',
  showWishlistSelector = true,
}: {
  productId: string;
  variantId: number;
  locale: string;
  className?: string;
  showWishlistSelector?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAccount();
  const { wishlists, isLoading, isSaved, addToWishlist, toggleSaved } =
    useWishlist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved = isSaved(productId, variantId);

  useEffect(() => {
    if (!isModalOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) setIsModalOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, isModalOpen]);

  function isSavedIn(wishlistId: string) {
    return (
      wishlists
        .find((wishlist) => wishlist.id === wishlistId)
        ?.lineItems.some(
          (item) =>
            item.productId === productId && item.variantId === variantId,
        ) ?? false
    );
  }

  async function onClick() {
    if (!isSignedIn) {
      const redirect = pathname || `/${locale}`;
      router.push(`/${locale}/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (showWishlistSelector) {
      setError(null);
      setIsModalOpen(true);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await toggleSaved(productId, variantId, locale);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update wishlist',
      );
    } finally {
      setBusy(false);
    }
  }

  async function selectWishlist(wishlistId: string) {
    setBusy(true);
    setError(null);
    try {
      await addToWishlist(productId, variantId, locale, 1, wishlistId);
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update wishlist',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={className}>
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          aria-label={
            showWishlistSelector
              ? 'Choose a wishlist'
              : saved
                ? 'Remove from wishlist'
                : 'Save to wishlist'
          }
          aria-pressed={saved}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/90 text-lg leading-none text-charcoal hover:border-terra hover:text-terra disabled:opacity-60"
        >
          {saved ? '♥' : '♡'}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy)
              setIsModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-selector-title"
            className="w-full max-w-md rounded-sm bg-white p-6 text-left shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="wishlist-selector-title"
                className="text-xl font-semibold text-charcoal"
              >
                Add to wishlist
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={busy}
                aria-label="Close"
                className="text-xl text-charcoal-light hover:text-charcoal disabled:opacity-60"
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <p className="mt-6 text-sm text-charcoal-light">
                Loading wishlists…
              </p>
            ) : wishlists.length === 0 ? (
              <div className="mt-6">
                <p className="text-sm text-charcoal-light">
                  You do not have a wishlist yet.
                </p>
                <Link
                  href="/account/wishlists"
                  locale={locale}
                  className="mt-4 inline-block text-sm text-terra hover:underline"
                >
                  Create a wishlist
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-2">
                {wishlists.map((wishlist) => {
                  const alreadySaved = isSavedIn(wishlist.id);
                  return (
                    <button
                      key={wishlist.id}
                      type="button"
                      onClick={() => selectWishlist(wishlist.id)}
                      disabled={busy || alreadySaved}
                      className="flex w-full items-center justify-between rounded-sm border border-border px-4 py-3 text-sm text-charcoal hover:border-terra disabled:cursor-default disabled:bg-cream disabled:opacity-70"
                    >
                      <span>{wishlist.name}</span>
                      <span className="text-charcoal-light">
                        {alreadySaved
                          ? 'Added'
                          : `${wishlist.lineItems.length} ${wishlist.lineItems.length === 1 ? 'item' : 'items'}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
