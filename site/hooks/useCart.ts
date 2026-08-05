'use client';

import useSWR from 'swr';
import type { Cart } from '@commercetools/platform-sdk';
import { useLocale } from 'next-intl';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCart() {
  const locale = useLocale();
  const { data, error, isLoading, mutate } = useSWR<Cart>(`/api/cart?locale=${locale}`, fetcher, {
    revalidateOnFocus: false,
  });

  async function addItem(productId: string, variantId: number, quantity = 1) {
    const updated = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId, quantity, locale }),
    }).then((res) => res.json());
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  async function changeQuantity(lineItemId: string, quantity: number) {
    const updated = await fetch(`/api/cart/items/${lineItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, locale }),
    }).then((res) => res.json());
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  async function removeItem(lineItemId: string) {
    const updated = await fetch(`/api/cart/items/${lineItemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    }).then((res) => res.json());
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  async function applyDiscountCode(code: string) {
    const updated = await fetch('/api/cart/discount-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, locale }),
    }).then((res) => res.json());
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  const itemCount = data?.lineItems?.reduce((sum, li) => sum + li.quantity, 0) ?? 0;

  return {
    cart: data,
    itemCount,
    isLoading,
    error,
    addItem,
    changeQuantity,
    removeItem,
    applyDiscountCode,
    refresh: () => mutate(),
  };
}
