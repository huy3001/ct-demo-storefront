'use client';

import useSWR from 'swr';
import type { Wishlist } from '@/lib/types';
import { KEY_WISHLIST } from '@/lib/cache-keys';
import { useAccount } from './useAccount';

type WishlistKey = readonly [typeof KEY_WISHLIST, string];

function isSavedInWishlist(wishlists: Wishlist[], productId: string, variantId?: number): boolean {
  return wishlists.some((wishlist) =>
    wishlist.lineItems.some(
      (item) =>
        item.productId === productId &&
        (typeof variantId === 'number' ? item.variantId === variantId : true)
    )
  );
}

function ensureOk(res: Response, fallbackMessage: string) {
  if (!res.ok) {
    return res
      .json()
      .catch(() => ({}))
      .then((body) => {
        throw new Error(typeof body?.message === 'string' ? body.message : fallbackMessage);
      });
  }
  return Promise.resolve();
}

async function removeLineItemRequest(wishlistId: string, lineItemId: string, locale: string) {
  const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineItemId, locale }),
  });
  await ensureOk(res, 'Failed to remove item from wishlist');
}

export function useWishlist() {
  const { customer } = useAccount();
  const customerId = customer?.id;

  const { data, error, isLoading, mutate } = useSWR<Wishlist[], Error, WishlistKey | null>(
    customerId ? [KEY_WISHLIST, customerId] : null,
    async () => {
      const res = await fetch('/api/wishlists');
      if (!res.ok) return [];
      return (await res.json()) as Wishlist[];
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const wishlists = data ?? [];

  async function addToWishlist(productId: string, variantId: number, locale: string, quantity = 1) {
    if (!customerId) throw new Error('Please sign in to save items');

    const previous = wishlists;
    const existingList = previous[0];
    const tempListId = '__temp_wishlist__';
    const targetListId = existingList?.id ?? tempListId;

    const optimisticWishlists = existingList
      ? previous.map((wishlist) =>
          wishlist.id === existingList.id
            ? {
                ...wishlist,
                lineItems: [
                  ...wishlist.lineItems,
                  {
                    lineItemId: `temp-${productId}-${variantId}`,
                    productId,
                    variantId,
                    quantity,
                    name: 'Saving…',
                  },
                ],
              }
            : wishlist
        )
      : [
          {
            id: tempListId,
            version: 0,
            name: 'My Wishlist',
            lineItems: [
              {
                lineItemId: `temp-${productId}-${variantId}`,
                productId,
                variantId,
                quantity,
                name: 'Saving…',
              },
            ],
          },
        ];

    await mutate(optimisticWishlists, { revalidate: false });

    try {
      let wishlistId = targetListId;
      if (!existingList) {
        const createRes = await fetch('/api/wishlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Wishlist', locale }),
        });
        await ensureOk(createRes, 'Failed to create wishlist');
        const created = (await createRes.json()) as Wishlist;
        wishlistId = created.id;
      }

      const addRes = await fetch(`/api/wishlists/${wishlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity, locale }),
      });
      await ensureOk(addRes, 'Failed to add item to wishlist');

      await mutate();
    } catch (err) {
      await mutate(previous, { revalidate: false });
      throw err;
    }
  }

  async function removeFromWishlist(wishlistId: string, lineItemId: string, locale: string) {
    const previous = wishlists;
    await mutate(
      previous.map((wishlist) =>
        wishlist.id === wishlistId
          ? { ...wishlist, lineItems: wishlist.lineItems.filter((item) => item.lineItemId !== lineItemId) }
          : wishlist
      ),
      { revalidate: false }
    );

    try {
      await removeLineItemRequest(wishlistId, lineItemId, locale);
      await mutate();
    } catch (err) {
      await mutate(previous, { revalidate: false });
      throw err;
    }
  }

  async function toggleSaved(productId: string, variantId: number, locale: string) {
    if (!customerId) throw new Error('Please sign in to save items');

    const matches = wishlists.flatMap((wishlist) =>
      wishlist.lineItems
        .filter((item) => item.productId === productId && item.variantId === variantId)
        .map((item) => ({ wishlistId: wishlist.id, lineItemId: item.lineItemId }))
    );

    if (matches.length > 0) {
      const previous = wishlists;
      await mutate(
        previous.map((wishlist) => ({
          ...wishlist,
          lineItems: wishlist.lineItems.filter(
            (item) => !matches.some((match) => match.wishlistId === wishlist.id && match.lineItemId === item.lineItemId)
          ),
        })),
        { revalidate: false }
      );

      try {
        await Promise.all(
          matches.map((match) => removeLineItemRequest(match.wishlistId, match.lineItemId, locale))
        );
        await mutate();
      } catch (err) {
        await mutate(previous, { revalidate: false });
        throw err;
      }
      return false;
    }

    await addToWishlist(productId, variantId, locale);
    return true;
  }

  function isSaved(productId: string, variantId?: number) {
    return isSavedInWishlist(wishlists, productId, variantId);
  }

  const totalItems = wishlists.reduce((sum, wishlist) => sum + wishlist.lineItems.length, 0);

  return {
    wishlists,
    isLoading,
    error,
    isReady: Boolean(customerId),
    totalItems,
    isSaved,
    addToWishlist,
    removeFromWishlist,
    toggleSaved,
    refresh: () => mutate(),
  };
}
