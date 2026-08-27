import type { ByProjectKeyRequestBuilder, ShoppingList } from '@commercetools/platform-sdk';
import { mapShoppingListToWishlist } from '@/lib/mappers/wishlist';

const WISHLIST_EXPAND = ['lineItems[*].variant'];
export const DEFAULT_WISHLIST_NAME = 'My Wishlist';

function normalizedWishlistName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function isDefaultWishlistName(name: string) {
  return normalizedWishlistName(name) === normalizedWishlistName(DEFAULT_WISHLIST_NAME);
}

function toNotFoundError(message = 'Wishlist not found') {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = 404;
  return err;
}

function toConflictError(message: string) {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = 409;
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

  let wishlists = body.results.map((list) => mapShoppingListToWishlist(list, locale));
  if (!wishlists.some((wishlist) => isDefaultWishlistName(wishlist.name))) {
    const defaultWishlist = await createWishlistRecord(
      apiRoot,
      customerId,
      locale,
      DEFAULT_WISHLIST_NAME
    );
    wishlists = [defaultWishlist, ...wishlists];
  }

  return wishlists.sort((left, right) => {
    const leftIsDefault = isDefaultWishlistName(left.name);
    const rightIsDefault = isDefaultWishlistName(right.name);
    if (leftIsDefault !== rightIsDefault) return leftIsDefault ? -1 : 1;
    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
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

async function createWishlistRecord(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  locale: string,
  name: string
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

export async function createWishlist(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  locale: string,
  name: string
) {
  const normalizedName = name.trim();
  if (!normalizedName) throw toConflictError('Wishlist name is required');
  if (isDefaultWishlistName(normalizedName)) {
    throw toConflictError(`A wishlist named "${DEFAULT_WISHLIST_NAME}" already exists`);
  }

  const wishlists = await getWishlists(apiRoot, customerId, locale);
  if (wishlists.some((wishlist) => normalizedWishlistName(wishlist.name) === normalizedWishlistName(normalizedName))) {
    throw toConflictError('A wishlist with this name already exists');
  }

  return createWishlistRecord(apiRoot, customerId, locale, normalizedName);
}

export async function renameWishlist(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string,
  name: string
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  const current = mapShoppingListToWishlist(list, locale);
  if (isDefaultWishlistName(current.name)) {
    throw toConflictError(`"${DEFAULT_WISHLIST_NAME}" cannot be renamed`);
  }

  const wishlists = await getWishlists(apiRoot, customerId, locale);
  if (wishlists.some((wishlist) =>
    wishlist.id !== wishlistId &&
    normalizedWishlistName(wishlist.name) === normalizedWishlistName(name)
  )) {
    throw toConflictError('A wishlist with this name already exists');
  }

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

export async function removeAllWishlistLineItems(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  if (!list.lineItems?.length) {
    return mapShoppingListToWishlist(list, locale);
  }

  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: list.id })
    .post({
      body: {
        version: list.version,
        actions: list.lineItems.map((lineItem) => ({
          action: 'removeLineItem' as const,
          lineItemId: lineItem.id,
        })),
      },
    })
    .execute();

  return mapShoppingListToWishlist(body, locale);
}

export async function deleteWishlist(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  wishlistId: string,
  locale: string
) {
  const list = await fetchOwnedWishlist(apiRoot, customerId, wishlistId);

  if (isDefaultWishlistName(mapShoppingListToWishlist(list, locale).name)) {
    throw toConflictError(`"${DEFAULT_WISHLIST_NAME}" cannot be deleted`);
  }

  await apiRoot
    .shoppingLists()
    .withId({ ID: list.id })
    .delete({ queryArgs: { version: list.version } })
    .execute();
}
