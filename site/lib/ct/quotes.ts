import type {
  ByProjectKeyRequestBuilder,
  Cart,
  CartDraft,
  CartUpdateAction,
  CustomLineItem,
  Customer,
  LineItem,
  Order,
  Quote as CtQuote,
  QuoteRequest,
  QuoteRequestDraft,
  TaxRate,
} from '@commercetools/platform-sdk';
import type { Quote, QuoteLineItem, QuoteStatus } from '@/types/quote';

const QUERY_LIMIT = 500;
const QUOTE_QUERY_BATCH_SIZE = 100;

type AssociateApi = ReturnType<
  ReturnType<ByProjectKeyRequestBuilder['asAssociate']>['withAssociateIdValue']
>;
type BusinessUnitApi = ReturnType<
  AssociateApi['inBusinessUnitKeyWithBusinessUnitKeyValue']
>;

/** Buyer-correctable problem that should surface as a 400 response. */
export class QuoteRequestError extends Error {}

export type QuoteCartContext = {
  cart: Cart;
  businessUnitKey: string;
};

function escapePredicate(value: string): string {
  return value.replace(/([\\"])/g, '\\$1');
}

function businessUnitApi(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
): BusinessUnitApi {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId: customerId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });
}

async function getBusinessUnitKeys(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<string[]> {
  const { body } = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId: customerId })
    .businessUnits()
    .get({ queryArgs: { limit: QUERY_LIMIT } })
    .execute();
  return [...new Set(body.results.map(({ key }) => key))];
}

async function storeContainsProducts(
  apiRoot: ByProjectKeyRequestBuilder,
  storeKey: string,
  productIds: string[],
): Promise<boolean> {
  const results = await Promise.all(
    productIds.map(async (ID) => {
      try {
        await apiRoot
          .inStoreKeyWithStoreKeyValue({ storeKey })
          .productProjections()
          .withId({ ID })
          .get()
          .execute();
        return true;
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode === 404) return false;
        throw error;
      }
    }),
  );
  return results.every(Boolean);
}

export async function createQuoteCartInBusinessUnit(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  cart: Cart,
  preserveShippingMethod = false,
): Promise<QuoteCartContext> {
  const businessUnitKeys = await getBusinessUnitKeys(apiRoot, customerId);
  const businessUnitKey = cart.businessUnit?.key ?? businessUnitKeys[0];
  if (!businessUnitKey || !businessUnitKeys.includes(businessUnitKey)) {
    throw new QuoteRequestError('The customer must belong to a business unit to request a quote.');
  }
  if (cart.businessUnit?.key === businessUnitKey) {
    return { cart, businessUnitKey };
  }
  if (cart.shippingMode !== 'Single') {
    throw new QuoteRequestError('Quote requests require a cart with a single delivery method.');
  }
  if (cart.taxMode !== 'Platform') {
    throw new QuoteRequestError('Quote requests from externally taxed carts are not supported.');
  }

  const unit = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId: customerId })
    .businessUnits()
    .withKey({ key: businessUnitKey })
    .get()
    .execute()
    .then(({ body }) => body);
  const allowedStoreKeys = [
    ...(unit.stores ?? []),
    ...(unit.inheritedStores ?? []),
  ].map(({ key }) => key);
  const productIds = [...new Set(cart.lineItems.map(({ productId }) => productId))];
  let storeKey: string | undefined;
  let storeChannelIds: string[] = [];
  if (allowedStoreKeys.length > 0) {
    // Candidate order: the cart's own store first, then the business unit's stores.
    const candidates = [
      ...(cart.store?.key && allowedStoreKeys.includes(cart.store.key)
        ? [cart.store.key]
        : []),
      ...allowedStoreKeys.filter((key) => key !== cart.store?.key),
    ];
    for (const candidate of candidates) {
      if (await storeContainsProducts(apiRoot, candidate, productIds)) {
        storeKey = candidate;
        break;
      }
    }
    if (!storeKey) {
      throw new QuoteRequestError(
        'The products in your cart are not available in your business unit\u2019s stores, so a quote cannot be requested.',
      );
    }
    const { body: store } = await apiRoot.stores().withKey({ key: storeKey }).get().execute();
    storeChannelIds = store.distributionChannels.map(({ id }) => id);
  }

  const lineItemChannelId = (channelId?: string): string | undefined => {
    if (storeChannelIds.length === 0) return channelId;
    return channelId && storeChannelIds.includes(channelId)
      ? channelId
      : storeChannelIds[0];
  };

  const cartDraft: CartDraft = {
    currency: cart.totalPrice.currencyCode,
    country: cart.country,
    locale: cart.locale,
    customerId,
    ...(storeKey ? { store: { typeId: 'store', key: storeKey } } : {}),
    shippingMode: 'Single',
    shippingAddress: cart.shippingAddress,
    billingAddress: cart.billingAddress,
    ...(preserveShippingMethod && cart.shippingInfo?.shippingMethod?.id
      ? {
          shippingMethod: {
            typeId: 'shipping-method',
            id: cart.shippingInfo.shippingMethod.id,
          },
        }
      : {}),
    ...(cart.shippingRateInput
      ? { shippingRateInput: cart.shippingRateInput }
      : {}),
    ...(cart.purchaseOrderNumber
      ? { purchaseOrderNumber: cart.purchaseOrderNumber }
      : {}),
    lineItems: cart.lineItems.map((item) => ({
      productId: item.productId,
      variantId: item.variant.id,
      quantity: item.quantity,
      ...(lineItemChannelId(item.distributionChannel?.id)
        ? {
            distributionChannel: {
              typeId: 'channel',
              id: lineItemChannelId(item.distributionChannel?.id)!,
            },
          }
        : {}),
      ...(item.supplyChannel?.id
        ? {
            supplyChannel: {
              typeId: 'channel',
              id: item.supplyChannel.id,
            },
          }
        : {}),
      ...(item.custom ? { custom: { type: item.custom.type, fields: item.custom.fields } } : {}),
    })),
    customLineItems: cart.customLineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      money: {
        currencyCode: item.money.currencyCode,
        centAmount: item.money.centAmount,
      },
      slug: item.slug,
      ...(item.taxCategory
        ? {
            taxCategory: {
              typeId: 'tax-category',
              id: item.taxCategory.id,
            },
          }
        : {}),
      ...(item.custom ? { custom: { type: item.custom.type, fields: item.custom.fields } } : {}),
    })),
  };
  const { body: quoteCart } = await businessUnitApi(
    apiRoot,
    customerId,
    businessUnitKey,
  ).carts().post({ body: cartDraft }).execute();

  return { cart: quoteCart, businessUnitKey };
}

/**
 * commercetools only evaluates Approval Rules for Orders that belong to a Business Unit, so
 * the cart handed to Checkout must be a Business Unit cart. Customers without a Business Unit
 * keep their plain cart.
 */
export async function ensureBusinessUnitCart(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  cart: Cart,
): Promise<Cart> {
  if (cart.businessUnit) return cart;
  const businessUnitKeys = await getBusinessUnitKeys(apiRoot, customerId);
  if (businessUnitKeys.length === 0) return cart;
  const { cart: businessUnitCart } = await createQuoteCartInBusinessUnit(
    apiRoot,
    customerId,
    cart,
    true,
  );
  return businessUnitCart;
}

export async function updateQuoteCartAddresses(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
  cart: Cart,
  shippingAddress: NonNullable<Cart['shippingAddress']>,
  billingAddress: NonNullable<Cart['billingAddress']>,
): Promise<Cart> {
  const actions: CartUpdateAction[] = [
    { action: 'setShippingAddress', address: shippingAddress },
    { action: 'setBillingAddress', address: billingAddress },
  ];
  const { body } = await businessUnitApi(apiRoot, customerId, businessUnitKey)
    .carts()
    .withId({ ID: cart.id })
    .post({ body: { version: cart.version, actions } })
    .execute();
  return body;
}

export async function setQuoteCartShippingMethod(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  businessUnitKey: string,
  cart: Cart,
  shippingMethodId: string,
): Promise<Cart> {
  const actions: CartUpdateAction[] = [{
    action: 'setShippingMethod',
    shippingMethod: { typeId: 'shipping-method', id: shippingMethodId },
  }];
  const { body } = await businessUnitApi(apiRoot, customerId, businessUnitKey)
    .carts()
    .withId({ ID: cart.id })
    .post({ body: { version: cart.version, actions } })
    .execute();
  return body;
}

export async function createCustomerQuoteRequest(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  cart: Cart,
  purchaseOrderNumber: string,
  businessUnitKey: string,
): Promise<QuoteRequest> {
  if (cart.businessUnit?.key !== businessUnitKey) {
    throw new QuoteRequestError('The quote request cart must belong to the selected business unit.');
  }

  const body: QuoteRequestDraft = {
    cart: { typeId: 'cart', id: cart.id },
    cartVersion: cart.version,
    purchaseOrderNumber,
  };
  const { body: quoteRequest } = await businessUnitApi(
    apiRoot,
    customerId,
    businessUnitKey,
  ).quoteRequests().post({ body }).execute();
  return quoteRequest;
}

async function resolveCustomerId(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId?: string,
  email?: string,
): Promise<string> {
  if (customerId) return customerId;
  if (!email) throw new Error('Not signed in');

  const { body } = await apiRoot.customers().get({
    queryArgs: {
      where: `email="${escapePredicate(email)}"`,
      limit: 1,
    },
  }).execute();
  const customer = body.results[0];
  if (!customer) throw new Error('Customer account not found');
  return customer.id;
}

async function getCustomer(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<Customer> {
  const { body } = await apiRoot.customers().withId({ ID: customerId }).get().execute();
  return body;
}

async function getAllQuoteRequests(
  apiRoot: BusinessUnitApi,
  customerId: string,
): Promise<QuoteRequest[]> {
  const results: QuoteRequest[] = [];
  let offset = 0;

  while (true) {
    const { body } = await apiRoot.quoteRequests().get({
      queryArgs: {
        where: `customer(id="${escapePredicate(customerId)}")`,
        sort: 'createdAt desc',
        limit: QUERY_LIMIT,
        offset,
      },
    }).execute();
    results.push(...body.results);
    if (body.total !== undefined && results.length >= body.total) return results;
    if (body.count < QUERY_LIMIT) return results;
    offset += body.count;
  }
}

async function getQuotesForRequests(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  requests: QuoteRequest[],
): Promise<CtQuote[]> {
  const quotes: CtQuote[] = [];

  const requestsByBusinessUnit = new Map<string, QuoteRequest[]>();
  for (const request of requests) {
    const key = request.businessUnit?.key;
    if (!key) continue;
    const group = requestsByBusinessUnit.get(key) ?? [];
    group.push(request);
    requestsByBusinessUnit.set(key, group);
  }

  for (const [businessUnitKey, unitRequests] of requestsByBusinessUnit) {
    const unitApi = businessUnitApi(apiRoot, customerId, businessUnitKey);
    const requestIds = [...new Set(unitRequests.map(({ id }) => id))];
    for (let index = 0; index < requestIds.length; index += QUOTE_QUERY_BATCH_SIZE) {
      const batch = requestIds.slice(index, index + QUOTE_QUERY_BATCH_SIZE);
      const where = batch
        .map((id) => `quoteRequest(id="${escapePredicate(id)}")`)
        .join(' or ');
      const { body } = await unitApi.quotes().get({
        queryArgs: { where, sort: 'createdAt desc', limit: QUERY_LIMIT },
      }).execute();
      quotes.push(...body.results);
    }
  }

  return quotes;
}

async function getOrdersForQuotes(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  quotes: CtQuote[],
  requests: QuoteRequest[],
): Promise<Order[]> {
  const orders: Order[] = [];
  const requestsById = new Map(requests.map((request) => [request.id, request]));
  const quotesByBusinessUnit = new Map<string, CtQuote[]>();
  for (const quote of quotes) {
    const key =
      quote.businessUnit?.key ??
      requestsById.get(quote.quoteRequest.id)?.businessUnit?.key;
    if (!key) continue;
    const group = quotesByBusinessUnit.get(key) ?? [];
    group.push(quote);
    quotesByBusinessUnit.set(key, group);
  }

  for (const [businessUnitKey, unitQuotes] of quotesByBusinessUnit) {
    const unitApi = businessUnitApi(apiRoot, customerId, businessUnitKey);
    const quoteIds = [...new Set(unitQuotes.map(({ id }) => id))];
    for (let index = 0; index < quoteIds.length; index += QUOTE_QUERY_BATCH_SIZE) {
      const batch = quoteIds.slice(index, index + QUOTE_QUERY_BATCH_SIZE);
      const where = batch
        .map((id) => `quote(id="${escapePredicate(id)}")`)
        .join(' or ');
      const { body } = await unitApi.orders().get({
        queryArgs: { where, sort: 'createdAt desc', limit: QUERY_LIMIT },
      }).execute();
      orders.push(...body.results);
    }
  }

  return orders;
}

function latestMatchingQuote(
  request: QuoteRequest,
  quotes: CtQuote[],
): CtQuote | undefined {
  const exactMatches = quotes.filter(
    (quote) => quote.quoteRequest.id === request.id,
  );
  return exactMatches.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )[0];
}

function latestMatchingOrder(
  quote: CtQuote,
  orders: Order[],
  customerId: string,
): Order | undefined {
  return orders
    .filter(
      (order) => order.quote?.id === quote.id && order.customerId === customerId,
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function localizedName(name: Record<string, string>, locale: string): string {
  return name[locale] ?? name[locale.split('-')[0]] ?? Object.values(name)[0] ?? '';
}

function mapLineItem(
  item: LineItem,
  locale: string,
  currencyCode: string,
): QuoteLineItem {
  const originalPriceCentAmount = item.price.value.centAmount;
  const priceCentAmount =
    item.price.discounted?.value.centAmount ??
    (item.discountedPricePerQuantity.length === 1
      ? item.discountedPricePerQuantity[0].discountedPrice.value.centAmount
      : originalPriceCentAmount);

  return {
    id: item.id,
    name: localizedName(item.name, locale),
    sku: item.variant.sku ?? '',
    quantity: item.quantity,
    priceCentAmount,
    ...(priceCentAmount < originalPriceCentAmount
      ? { originalPriceCentAmount }
      : {}),
    totalCentAmount: item.totalPrice.centAmount,
    currencyCode: item.totalPrice.currencyCode || currencyCode,
    ...(item.variant.images?.[0]?.url
      ? { imageUrl: item.variant.images[0].url }
      : {}),
  };
}

function mapCustomLineItem(
  item: CustomLineItem,
  locale: string,
  currencyCode: string,
): QuoteLineItem {
  return {
    id: item.id,
    name: localizedName(item.name, locale),
    sku: '',
    quantity: item.quantity,
    priceCentAmount: item.money.centAmount,
    totalCentAmount: item.totalPrice.centAmount,
    currencyCode: item.totalPrice.currencyCode || currencyCode,
  };
}

function beforeTax(
  centAmount: number,
  taxRate?: TaxRate,
): number {
  return taxRate?.includedInPrice && taxRate.amount > 0
    ? Math.round(centAmount / (1 + taxRate.amount))
    : centAmount;
}

function lineSubtotal(
  lineItems: LineItem[],
  customLineItems: CustomLineItem[],
): number {
  return lineItems.reduce(
    (sum, item) =>
      sum +
      beforeTax(item.price.value.centAmount, item.taxRate) * item.quantity,
    0,
  ) + customLineItems.reduce(
    (sum, item) =>
      sum + beforeTax(item.money.centAmount, item.taxRate) * item.quantity,
    0,
  );
}

function lineDiscounts(
  lineItems: LineItem[],
  customLineItems: CustomLineItem[],
): number {
  const productDiscounts = lineItems.reduce((sum, item) => {
    const discountedUnitPrice = item.price.discounted?.value.centAmount;
    return sum + (
      discountedUnitPrice === undefined
        ? 0
        : beforeTax(
            Math.max(0, item.price.value.centAmount - discountedUnitPrice),
            item.taxRate,
          ) * item.quantity
    );
  }, 0);
  const cartDiscounts = [...lineItems, ...customLineItems].reduce(
    (sum, item) => sum + item.discountedPricePerQuantity.reduce(
      (quantitySum, quantityPrice) =>
        quantitySum + quantityPrice.discountedPrice.includedDiscounts.reduce(
          (discountSum, discount) =>
            discountSum +
            beforeTax(
              discount.discountedAmount.centAmount,
              item.taxRate,
            ) *
              quantityPrice.quantity,
          0,
        ),
      0,
    ),
    0,
  );
  return productDiscounts + cartDiscounts;
}

function lineTax(
  lineItems: LineItem[],
  customLineItems: CustomLineItem[],
): number {
  return [...lineItems, ...customLineItems].reduce(
    (sum, item) => sum + (item.taxedPrice?.totalTax?.centAmount ?? 0),
    0,
  );
}

function getStatus(request: QuoteRequest, quote?: CtQuote): QuoteStatus {
  const quoteStatus: Record<string, QuoteStatus> = {
    Pending: 'In Progress',
    Accepted: 'Accepted',
    Declined: 'Declined',
    RenegotiationRequested: 'Renegotiating',
    RenegotiationAddressed: 'Renegotiated',
    Withdrawn: 'Withdrawn',
  };
  const requestStatus: Record<string, QuoteStatus> = {
    Submitted: 'Submitted',
    Accepted: 'In Progress',
    Rejected: 'Rejected',
    Withdrawn: 'Withdrawn',
  };
  return (quote && quoteStatus[quote.quoteState]) ??
    requestStatus[request.quoteRequestState] ??
    'In Progress';
}

function mapQuoteRequest(
  request: QuoteRequest,
  customer: Customer,
  locale: string,
  merchantCenterQuote?: CtQuote,
  merchantCenterOrder?: Order,
): Quote {
  const itemSource = merchantCenterOrder ?? merchantCenterQuote ?? request;
  const currencyCode = itemSource.totalPrice.currencyCode;
  const lineItems = itemSource.lineItems;
  const customLineItems = itemSource.customLineItems;
  const subtotalCentAmount = lineSubtotal(lineItems, customLineItems);
  const discountCentAmount =
    lineDiscounts(lineItems, customLineItems) +
    (merchantCenterOrder?.discountOnTotalPrice?.discountedNetAmount?.centAmount ??
      merchantCenterOrder?.discountOnTotalPrice?.discountedAmount.centAmount ??
      0);
  const taxCentAmount =
    merchantCenterOrder?.taxedPrice?.totalTax?.centAmount ??
    merchantCenterQuote?.taxedPrice?.totalTax?.centAmount ??
    request.taxedPrice?.totalTax?.centAmount ??
    lineTax(lineItems, customLineItems);
  const totalCentAmount =
    merchantCenterOrder?.taxedPrice?.totalGross.centAmount ??
    merchantCenterOrder?.totalPrice.centAmount ??
    merchantCenterQuote?.taxedPrice?.totalGross.centAmount ??
    merchantCenterQuote?.totalPrice.centAmount ??
    request.taxedPrice?.totalGross.centAmount ??
    request.totalPrice.centAmount;
  const displayName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ') || customer.email;
  const activity = [
    { id: `${request.id}-submitted`, label: 'Quote request submitted' },
    ...(merchantCenterQuote
      ? [{ id: `${request.id}-response`, label: 'Seller response received' }]
      : []),
  ];

  return {
    id: request.id,
    status: getStatus(request, merchantCenterQuote),
    createdAt: request.createdAt,
    lastModifiedAt: merchantCenterQuote?.lastModifiedAt ?? request.lastModifiedAt,
    businessUnit: request.businessUnit?.key ?? '',
    subtotalCentAmount,
    taxCentAmount,
    discountCentAmount,
    totalCentAmount,
    currencyCode,
    poNumber:
      merchantCenterOrder?.purchaseOrderNumber ??
      merchantCenterQuote?.purchaseOrderNumber ??
      request.purchaseOrderNumber ??
      '',
    owner: displayName || request.customer.id,
    customerEmail: customer.email,
    deliveryAddress: request.shippingAddress
      ? {
          firstName: request.shippingAddress.firstName,
          lastName: request.shippingAddress.lastName,
          company: request.shippingAddress.company,
          streetName: request.shippingAddress.streetName,
          streetNumber: request.shippingAddress.streetNumber,
          additionalStreetInfo: request.shippingAddress.additionalStreetInfo,
          postalCode: request.shippingAddress.postalCode,
          city: request.shippingAddress.city,
          state: request.shippingAddress.state,
          country: request.shippingAddress.country,
        }
      : undefined,
    billingAddress: request.billingAddress
      ? {
          firstName: request.billingAddress.firstName,
          lastName: request.billingAddress.lastName,
          company: request.billingAddress.company,
          streetName: request.billingAddress.streetName,
          streetNumber: request.billingAddress.streetNumber,
          additionalStreetInfo: request.billingAddress.additionalStreetInfo,
          postalCode: request.billingAddress.postalCode,
          city: request.billingAddress.city,
          state: request.billingAddress.state,
          country: request.billingAddress.country,
        }
      : undefined,
    shippingMethodName: request.shippingInfo?.shippingMethodName,
    activity,
    items: [
      ...lineItems.map((item) => mapLineItem(item, locale, currencyCode)),
      ...customLineItems.map((item) =>
        mapCustomLineItem(item, locale, currencyCode),
      ),
    ],
  };
}

async function mapRequests(
  apiRoot: ByProjectKeyRequestBuilder,
  requests: QuoteRequest[],
  customerId: string,
  locale: string,
): Promise<Quote[]> {
  const [customer, quotes] = await Promise.all([
    getCustomer(apiRoot, customerId),
    getQuotesForRequests(apiRoot, customerId, requests),
  ]);
  const orders = await getOrdersForQuotes(
    apiRoot,
    customerId,
    quotes,
    requests,
  );

  return requests.map((request) => {
    const quote = latestMatchingQuote(request, quotes);
    return mapQuoteRequest(
      request,
      customer,
      locale,
      quote,
      quote ? latestMatchingOrder(quote, orders, customerId) : undefined,
    );
  });
}

export async function getCustomerQuotes(
  apiRoot: ByProjectKeyRequestBuilder,
  identity: { customerId?: string; email?: string },
  locale: string,
): Promise<Quote[]> {
  const customerId = await resolveCustomerId(
    apiRoot,
    identity.customerId,
    identity.email,
  );
  const businessUnitKeys = await getBusinessUnitKeys(apiRoot, customerId);
  const requestsByBusinessUnit = await Promise.all(
    businessUnitKeys.map((key) =>
      getAllQuoteRequests(
        businessUnitApi(apiRoot, customerId, key),
        customerId,
      ),
    ),
  );
  const requests = [
    ...new Map(
      requestsByBusinessUnit
        .flat()
        .map((request) => [request.id, request]),
    ).values(),
  ];
  return mapRequests(apiRoot, requests, customerId, locale);
}

export async function getCustomerQuote(
  apiRoot: ByProjectKeyRequestBuilder,
  identity: { customerId?: string; email?: string },
  quoteRequestId: string,
  locale: string,
): Promise<Quote | undefined> {
  const customerId = await resolveCustomerId(
    apiRoot,
    identity.customerId,
    identity.email,
  );
  const businessUnitKeys = await getBusinessUnitKeys(apiRoot, customerId);
  let request: QuoteRequest | undefined;
  for (const key of businessUnitKeys) {
    try {
      const { body } = await businessUnitApi(apiRoot, customerId, key)
        .quoteRequests()
        .withId({ ID: quoteRequestId })
        .get()
        .execute();
      request = body;
      break;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 404) throw error;
    }
  }
  if (!request || request.customer.id !== customerId) return undefined;

  const [customer, quotes] = await Promise.all([
    getCustomer(apiRoot, customerId),
    getQuotesForRequests(apiRoot, customerId, [request]),
  ]);
  const orders = await getOrdersForQuotes(
    apiRoot,
    customerId,
    quotes,
    [request],
  );
  const quote = latestMatchingQuote(request, quotes);
  return mapQuoteRequest(
    request,
    customer,
    locale,
    quote,
    quote ? latestMatchingOrder(quote, orders, customerId) : undefined,
  );
}
