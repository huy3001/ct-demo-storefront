'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import Skeleton from '@/components/ui/atoms/skeleton';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';

export default function WishlistListPage({ locale }: { locale: string }) {
  const translate = useTranslations();
  const { wishlists, isLoading, createWishlist, deleteWishlist } =
    useWishlist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(
    null,
  );
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isCreating) setIsModalOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isCreating, isModalOpen]);

  function openModal() {
    setName('');
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (!isCreating) setIsModalOpen(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError(translate('wishlist.wishlist-required'));
      return;
    }
    if (
      wishlists.some(
        (wishlist) =>
          wishlist.name.trim().toLocaleLowerCase() ===
          normalizedName.toLocaleLowerCase(),
      )
    ) {
      setError(translate('wishlist.wishlist-already-exists'));
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      await createWishlist(normalizedName, locale);
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : translate('wishlist.wishlist-create-failed'),
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function onRemove(wishlistId: string, wishlistName: string) {
    if (
      !window.confirm(
        `${translate('common.remove')} "${wishlistName}"? ${translate('wishlist.wishlist-products-no-longer-saved')}.`,
      )
    ) {
      return;
    }

    setRemovingWishlistId(wishlistId);
    setRemoveError(null);
    try {
      await deleteWishlist(wishlistId, locale);
    } catch (err) {
      setRemoveError(
        err instanceof Error
          ? err.message
          : translate('wishlist.wishlist-remove-failed'),
      );
    } finally {
      setRemovingWishlistId(null);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-5 w-full" />;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-charcoal">
          {translate('account.wishlists')}
        </h1>
        <button
          type="button"
          onClick={openModal}
          className="rounded-sm bg-charcoal px-4 py-2 text-sm text-white hover:bg-terra"
        >
          {translate('wishlist.new-wishlist')}
        </button>
      </div>

      {removeError && (
        <p className="mb-4 text-sm text-red-600">{removeError}</p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 xl:grid-cols-4">
        {wishlists.map((wishlist) => {
          const preview = wishlist.lineItems.slice(0, 3);
          const isDefault =
            wishlist.name.trim().toLocaleLowerCase() === 'my wishlist';
          return (
            <div
              key={wishlist.id}
              className="flex min-h-32 flex-col rounded-sm border border-border bg-white p-4 transition-colors hover:border-terra"
            >
              <Link
                href={`/account/wishlists/${wishlist.id}`}
                locale={locale}
                className="group flex flex-1 flex-col"
              >
                <h2 className="font-medium text-charcoal group-hover:text-terra">
                  {wishlist.name}
                </h2>
                <span className="text-sm text-charcoal-light">
                  {wishlist.lineItems.length}
                  {wishlist.lineItems.length === 1
                    ? ` ${translate('cart.item')}`
                    : ` ${translate('product.items')}`}
                </span>
                <div className="mt-4 flex gap-2">
                  {preview.length > 0 &&
                    preview.map((item) =>
                      item.image ? (
                        <div
                          key={item.lineItemId}
                          className="relative h-14 w-14 overflow-hidden rounded-sm bg-cream-dark"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          key={item.lineItemId}
                          className="h-14 w-14 rounded-sm bg-cream-dark"
                        />
                      ),
                    )}
                </div>
              </Link>
              {!isDefault && (
                <button
                  type="button"
                  onClick={() => onRemove(wishlist.id, wishlist.name)}
                  disabled={removingWishlistId !== null}
                  className="mt-4 self-start text-sm text-terra hover:text-red-600 disabled:opacity-60"
                >
                  {removingWishlistId === wishlist.id
                    ? translate('wishlist.removing')
                    : translate('common.remove')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-wishlist-title"
            className="w-full max-w-md rounded-sm bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="create-wishlist-title"
                className="text-xl font-semibold text-charcoal"
              >
                {translate('wishlist.new-wishlist')}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={isCreating}
                aria-label="Close"
                className="text-xl text-charcoal-light hover:text-charcoal disabled:opacity-60"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={onSubmit}
              className="mt-6"
            >
              <Input
                label={translate('wishlist.wishlist-name')}
                id="wishlist-name"
                name="wishlistName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoFocus
                aria-describedby={error ? 'wishlist-name-error' : undefined}
              />
              {error && (
                <p
                  id="wishlist-name-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {error}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isCreating}
                  className="leading-3.5"
                >
                  {translate('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="leading-3.5"
                >
                  {isCreating
                    ? translate('wishlist.creating')
                    : translate('wishlist.create-wishlist')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
