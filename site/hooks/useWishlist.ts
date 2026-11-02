'use client';

import { useMemo } from 'react';
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

  const wishlists = useMemo(
    () => [...(data ?? [])].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
    [data],
  );

  async function createWishlist(name: string, locale: string) {
    const res = await fetch('/api/wishlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, locale }),
    });
    await ensureOk(res, 'Failed to create wishlist');
    const created = (await res.json()) as Wishlist;
    await mutate();
    return created;
  }

  async function addToWishlist(
    productId: string,
    variantId: number,
    locale: string,
    quantity = 1,
    wishlistId?: string,
  ) {
    if (!customerId) throw new Error('Please sign in to save items');

    const previous = wishlists;
    const existingList = wishlistId
      ? previous.find((wishlist) => wishlist.id === wishlistId)
      : previous.find((wishlist) => wishlist.name.toLocaleLowerCase() === 'my wishlist');
    if (wishlistId && !existingList) throw new Error('Wishlist not found');
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
            createdAt: new Date().toISOString(),
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
        const refreshed = await mutate();
        const created = (refreshed ?? []).find(
          (wishlist) => wishlist.name.toLocaleLowerCase() === 'my wishlist'
        );
        if (!created) throw new Error('Default wishlist is unavailable');
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

  async function removeAllFromWishlist(wishlistId: string, locale: string) {
    const previous = wishlists;
    await mutate(
      previous.map((wishlist) =>
        wishlist.id === wishlistId ? { ...wishlist, lineItems: [] } : wishlist
      ),
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeAll: true, locale }),
      });
      await ensureOk(res, 'Failed to remove all items from wishlist');
      await mutate();
    } catch (err) {
      await mutate(previous, { revalidate: false });
      throw err;
    }
  }

  async function deleteWishlist(wishlistId: string, locale: string) {
    if (!customerId) throw new Error('Please sign in to manage wishlists');

    const previous = wishlists;
    const wishlist = previous.find((item) => item.id === wishlistId);
    if (!wishlist) throw new Error('Wishlist not found');
    if (wishlist.name.trim().toLocaleLowerCase() === 'my wishlist') {
      throw new Error('"My Wishlist" cannot be removed');
    }

    await mutate(previous.filter((item) => item.id !== wishlistId), { revalidate: false });

    try {
      const res = await fetch(`/api/wishlists/${wishlistId}?locale=${encodeURIComponent(locale)}`, {
        method: 'DELETE',
      });
      await ensureOk(res, 'Failed to remove wishlist');
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
    createWishlist,
    addToWishlist,
    removeFromWishlist,
    removeAllFromWishlist,
    deleteWishlist,
    toggleSaved,
    refresh: () => mutate(),
  };
}
