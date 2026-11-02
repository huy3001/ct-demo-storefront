import type { BaseAddress, ByProjectKeyRequestBuilder, Cart, CartUpdateAction } from '@commercetools/platform-sdk';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type { SessionPayload } from './session-cookie';

function localeConfig(locale: string) {
  return COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
}

/**
 * Fetches the shopper's active cart, or creates one, using the plain (non-`me`) cart
 * endpoints tagged with the session's anonymousId/customerId — this API Client has no
 * `manage_my_*` scopes, so `.me().carts()` is unavailable (see lib/ct/client.ts).
 * Returns the cart plus the session, updated with the resolved cartId so callers can
 * persist it back into the cookie.
 */
export async function getOrCreateCart(
  apiRoot: ByProjectKeyRequestBuilder,
  session: SessionPayload,
  locale: string
): Promise<{ cart: Cart; session: SessionPayload }> {
  const { currency, country } = localeConfig(locale);

  if (session.cartId) {
    try {
      const { body } = await apiRoot
        .carts()
        .withId({ ID: session.cartId })
        .get({ queryArgs: { expand: ['lineItems[*].variant'] } })
        .execute();
      if (body.cartState === 'Active') return { cart: body, session };
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status !== 404) throw err;
    }
  }

  const ownerFilter = session.customerId
    ? `customerId="${session.customerId}"`
    : `anonymousId="${session.anonymousId}"`;
  const { body: existing } = await apiRoot
    .carts()
    .get({
      queryArgs: {
        where: [`cartState="Active"`, ownerFilter],
        sort: ['lastModifiedAt desc'],
        limit: 1,
        expand: ['lineItems[*].variant'],
      },
    })
    .execute();

  if (existing.results.length > 0) {
    const cart = existing.results[0];
    return { cart, session: { ...session, cartId: cart.id } };
  }

  const { body: created } = await apiRoot
    .carts()
    .post({
      body: {
        currency,
        country,
        ...(session.customerId ? { customerId: session.customerId } : { anonymousId: session.anonymousId }),
      },
    })
    .execute();

  return { cart: created, session: { ...session, cartId: created.id } };
}

export async function addLineItem(
  apiRoot: ByProjectKeyRequestBuilder,
  cart: Cart,
  productId: string,
  variantId: number,
  quantity: number,
  distributionChannelId?: string,
): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{
          action: 'addLineItem',
          productId,
          variantId,
          quantity,
          ...(distributionChannelId
            ? {
                distributionChannel: {
                  typeId: 'channel',
                  id: distributionChannelId,
                },
              }
            : {}),
        }],
      },
    })
    .execute();
  return body;
}

export async function addLineItems(
  apiRoot: ByProjectKeyRequestBuilder,
  cart: Cart,
  items: Array<{ productId: string; variantId: number; quantity: number }>,
): Promise<Cart> {
  if (items.length === 0) return cart;

  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: items.map((item) => ({ action: 'addLineItem' as const, ...item })),
      },
    })
    .execute();
  return body;
}

export async function setCheckoutAddresses(
  apiRoot: ByProjectKeyRequestBuilder,
  cart: Cart,
  shippingAddress?: BaseAddress,
  billingAddress?: BaseAddress,
): Promise<Cart> {
  const actions: CartUpdateAction[] = [
    { action: 'setShippingAddress', ...(shippingAddress ? { address: shippingAddress } : {}) },
    { action: 'setBillingAddress', ...(billingAddress ? { address: billingAddress } : {}) },
  ];

  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({ body: { version: cart.version, actions } })
    .execute();
  return body;
}

export async function setCartShippingMethod(
  apiRoot: ByProjectKeyRequestBuilder,
  cart: Cart,
  shippingMethodId: string,
): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{ action: 'setShippingMethod', shippingMethod: { typeId: 'shipping-method', id: shippingMethodId } }],
      },
    })
    .execute();
  return body;
}

export async function changeLineItemQuantity(
  apiRoot: ByProjectKeyRequestBuilder,
  cart: Cart,
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{ action: 'changeLineItemQuantity', lineItemId, quantity }],
      },
    })
    .execute();
  return body;
}

export async function removeLineItem(apiRoot: ByProjectKeyRequestBuilder, cart: Cart, lineItemId: string): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{ action: 'removeLineItem', lineItemId }],
      },
    })
    .execute();
  return body;
}

export async function clearCart(apiRoot: ByProjectKeyRequestBuilder, cart: Cart): Promise<Cart> {
  if (cart.lineItems.length === 0) return cart;

  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: cart.lineItems.map((lineItem) => ({ action: 'removeLineItem' as const, lineItemId: lineItem.id })),
      },
    })
    .execute();
  return body;
}

export async function applyDiscountCode(apiRoot: ByProjectKeyRequestBuilder, cart: Cart, code: string): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{ action: 'addDiscountCode', code }],
      },
    })
    .execute();
  return body;
}

export async function removeDiscountCode(
  apiRoot: ByProjectKeyRequestBuilder,
  cart: Cart,
  discountCodeId: string
): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{ action: 'removeDiscountCode', discountCode: { typeId: 'discount-code', id: discountCodeId } }],
      },
    })
    .execute();
  return body;
}
