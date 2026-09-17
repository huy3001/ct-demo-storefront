'use client';

import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useAccount } from '@/hooks/useAccount';
import { useWishlist } from '@/hooks/useWishlist';
import Link from '@/components/ui/atoms/link';
import Modal from '@/components/ui/organisms/modal';
import useClassNames from '@/hooks/useClassNames';

interface WishlistButtonProps {
  productId: string;
  variantId: number;
  className?: string;
  showWishlistSelector?: boolean;
}

const WishlistButton: FC<WishlistButtonProps> = ({
  productId,
  variantId,
  className,
  showWishlistSelector = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const { isSignedIn } = useAccount();
  const { wishlists, isLoading, isSaved, addToWishlist, toggleSaved } =
    useWishlist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useTranslations();

  const saved = isSaved(productId, variantId);

  const pathClassNames = useClassNames([
    'transition duration-150 ease-out hover:fill-red-500 hover:stroke-red-500',
    saved ? 'fill-red-500 stroke-red-500' : '!fill-white',
  ]);

  const buttonClassName = className || 'top-1 right-0 size-6';

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
      setIsModalOpen(true);
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      await toggleSaved(productId, variantId, locale);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update wishlist',
      );
      toast.error(
        err instanceof Error ? err.message : 'Unable to update wishlist',
      );
    } finally {
      setProcessing(false);
    }
  }

  async function selectWishlist(wishlistId: string) {
    setProcessing(true);
    setError(null);
    try {
      await addToWishlist(productId, variantId, locale, 1, wishlistId);
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update wishlist',
      );
      toast.error(
        err instanceof Error ? err.message : 'Unable to update wishlist',
      );
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (!isModalOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !processing) setIsModalOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [processing, isModalOpen]);

  return (
    <>
      <button
        onClick={onClick}
        aria-label={translate('wishlist.add-to-wishlist')}
        className={className}
      >
        <HeartIcon
          className={buttonClassName + ' ' + pathClassNames}
          strokeWidth={'1'}
          data-testid="heart-icon"
        />
      </button>

      {isModalOpen && (
        <Modal
          shouldCloseOnOverlayClick
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="w-full max-w-md rounded-sm bg-white p-6! text-left shadow-sm"
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
              disabled={processing}
              aria-label="Close"
              className="text-xl text-charcoal-light hover:text-charcoal disabled:opacity-60"
            >
              <XMarkIcon className="h-6 w-6" />
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
                link="/account/wishlists"
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
                    disabled={processing || alreadySaved}
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
        </Modal>
      )}
    </>
  );
};

export default WishlistButton;
