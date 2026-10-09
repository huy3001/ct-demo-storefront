'use client';

import useSWR from 'swr';
import type { Cart } from '@commercetools/platform-sdk';
import { useLocale } from 'next-intl';

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    throw new Error((body as { error?: string; message?: string }).error ?? (body as { message?: string }).message ?? 'Cart request failed');
  }
  return body as T;
}

const fetcher = (url: string) => fetch(url).then((response) => readJson<Cart>(response));

export function useCart() {
  const locale = useLocale();
  const { data, error, isLoading, mutate } = useSWR<Cart | null>(`/api/cart?locale=${locale}`, fetcher, {
    revalidateOnFocus: false,
  });

  async function addItemRequest(item: {
    productId?: string;
    variantId?: number;
    sku?: string;
    quantity?: number;
  }) {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, locale }),
    });
    const updated = await readJson<Cart>(response);
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  async function addItem(productId: string, variantId: number, quantity = 1) {
    return addItemRequest({ productId, variantId, quantity });
  }

  async function addItemBySku(sku: string, quantity = 1) {
    return addItemRequest({ sku, quantity });
  }

  async function changeQuantity(lineItemId: string, quantity: number) {
    const response = await fetch(`/api/cart/items/${lineItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, locale }),
    });
    const updated = await readJson<Cart>(response);
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  async function removeItem(lineItemId: string) {
    const response = await fetch(`/api/cart/items/${lineItemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    });
    const updated = await readJson<Cart>(response);
    await mutate(updated, { revalidate: false });
    return updated as Cart;
  }

  async function clearCart() {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    });
    const updated = await readJson<Cart>(response);
    await mutate(updated, { revalidate: false });
    return updated;
  }

  async function completeCheckout(cartId: string) {
    const response = await fetch('/api/checkout/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId }),
    });
    await readJson<{ success: true }>(response);
    await mutate(null, { revalidate: false });
  }

  async function applyDiscountCode(code: string) {
    const response = await fetch('/api/cart/discount-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, locale }),
    });
    const updated = await readJson<Cart>(response);
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
    addItemBySku,
    changeQuantity,
    removeItem,
    clearCart,
    completeCheckout,
    applyDiscountCode,
    refresh: () => mutate(),
  };
}
