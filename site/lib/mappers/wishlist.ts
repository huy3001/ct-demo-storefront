import type { ShoppingList, ShoppingListLineItem } from '@commercetools/platform-sdk';
import type { Price, Wishlist, WishlistItem } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

function mapMoneyPrice(value?: { centAmount: number; currencyCode: string }): Price | undefined {
  if (!value) return undefined;
  return {
    centAmount: value.centAmount,
    currencyCode: value.currencyCode,
  };
}

function mapWishlistLineItem(lineItem: ShoppingListLineItem, locale: string): WishlistItem {
  return {
    lineItemId: lineItem.id,
    productId: lineItem.productId,
    variantId: lineItem.variantId,
    quantity: lineItem.quantity,
    name: getLocalizedString(lineItem.name, locale),
    image: lineItem.variant?.images?.[0]?.url,
    price: mapMoneyPrice(lineItem.variant?.price?.value),
    slug: getLocalizedString(lineItem.productSlug, locale),
  };
}

export function mapShoppingListToWishlist(list: ShoppingList, locale: string): Wishlist {
  return {
    id: list.id,
    version: list.version,
    name: getLocalizedString(list.name, locale),
    lineItems: (list.lineItems ?? []).map((lineItem) => mapWishlistLineItem(lineItem, locale)),
  };
}
