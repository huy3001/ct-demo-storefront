import type { ByProjectKeyRequestBuilder, ShoppingList } from '@commercetools/platform-sdk';
import { mapShoppingListToWishlist } from '@/lib/mappers/wishlist';

const WISHLIST_EXPAND = ['lineItems[*].variant'];

function toNotFoundError(message = 'Wishlist not found') {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = 404;
  return err;
}

function wishlistCustomerWhere(customerId: string) {
  return `customer(id="${customerId}")`;
}

async function fetchOwnedWishlist(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: wishlistId })
    .get({ queryArgs: { expand: WISHLIST_EXPAND } })
    .execute();

  if (body.customer?.id !== customerId) {
    throw toNotFoundError();
  }

  return body;
}

export async function getWishlists(apiRoot: ByProjectKeyRequestBuilder, customerId: string, locale: string) {
  const { body } = await apiRoot
    .shoppingLists()
    .get({
      queryArgs: {
        where: [wishlistCustomerWhere(customerId)],
        sort: ['lastModifiedAt desc'],
        expand: WISHLIST_EXPAND,
      },
    })
    .execute();

  return body.results.map((list) => mapShoppingListToWishlist(list, locale));
}

export async function getWishlistById(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);
  return mapShoppingListToWishlist(list, locale);
}

export async function createWishlist(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  locale: string,
  name = 'My Wishlist'
) {
  const { body } = await apiRoot
    .shoppingLists()
    .post({
      body: {
        name: { [locale]: name },
        customer: { id: customerId, typeId: 'customer' },
      },
    })
    .execute();

  return mapShoppingListToWishlist(body, locale);
}

export async function renameWishlist(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string,
  name: string
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: list.id })
    .post({
      body: {
        version: list.version,
        actions: [{ action: 'changeName', name: { [locale]: name } }],
      },
    })
    .execute();

  return mapShoppingListToWishlist(body, locale);
}

export async function addWishlistLineItem(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string,
  productId: string,
  variantId: number,
  quantity: number
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: list.id })
    .post({
      body: {
        version: list.version,
        actions: [{ action: 'addLineItem', productId, variantId, quantity }],
      },
    })
    .execute();

  return mapShoppingListToWishlist(body, locale);
}

export async function removeWishlistLineItem(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string,
  lineItemId: string
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  const hasLineItem = list.lineItems?.some((lineItem) => lineItem.id === lineItemId);
  if (!hasLineItem) {
    throw toNotFoundError('Wishlist item not found');
  }

  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: list.id })
    .post({
      body: {
        version: list.version,
        actions: [{ action: 'removeLineItem', lineItemId }],
      },
    })
    .execute();

  return mapShoppingListToWishlist(body, locale);
}

export async function deleteWishlist(apiRoot: ByProjectKeyRequestBuilder, customerId: string, wishlistId: string) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  await apiRoot
    .shoppingLists()
    .withId({ ID: list.id })
    .delete({ queryArgs: { version: list.version } })
    .execute();
}
