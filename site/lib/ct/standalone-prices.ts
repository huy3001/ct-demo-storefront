import type {
  ByProjectKeyRequestBuilder,
  ProductProjection,
  StandalonePrice,
} from '@commercetools/platform-sdk';

const PAGE_SIZE = 500;

function escapePredicateValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isCurrentlyValid(price: StandalonePrice, now: number): boolean {
  if (!price.active) return false;
  if (price.validFrom && new Date(price.validFrom).getTime() > now) return false;
  if (price.validUntil && new Date(price.validUntil).getTime() <= now) return false;
  return true;
}

function scopeRank(
  price: StandalonePrice,
  currency: string,
  country: string,
  priceChannel?: string,
  now?: number,
): number {
  if (
    price.value.currencyCode !== currency ||
    price.customerGroup ||
    !isCurrentlyValid(price, now ?? Date.now())
  ) {
    return -1;
  }
  if (price.channel?.id !== priceChannel) return -1;
  if (price.country === country) return 2;
  return price.country === undefined ? 1 : -1;
}

function productSkus(products: ProductProjection[]): string[] {
  return [
    ...new Set(
      products
        .flatMap((product) => [product.masterVariant, ...(product.variants ?? [])])
        .map((variant) => variant.sku)
        .filter((sku): sku is string => Boolean(sku)),
    ),
  ];
}

export async function getStandalonePricesBySku(
  apiRoot: ByProjectKeyRequestBuilder,
  products: ProductProjection[],
  currency: string,
  country: string,
  priceChannel?: string,
): Promise<Map<string, StandalonePrice>> {
  const skus = productSkus(products);
  if (skus.length === 0) return new Map();

  const prices: StandalonePrice[] = [];
  let offset = 0;

  do {
    const { body } = await apiRoot
      .standalonePrices()
      .get({
        queryArgs: {
          where: `sku in (${skus.map((sku) => `"${escapePredicateValue(sku)}"`).join(',')})`,
          limit: PAGE_SIZE,
          offset,
          withTotal: false,
        },
      })
      .execute();
    prices.push(...body.results);
    if (body.count < PAGE_SIZE) break;
    offset += body.count;
  } while (true);

  const selectedPrices = new Map<string, StandalonePrice>();
  const now = Date.now();

  for (const price of prices) {
    const existing = selectedPrices.get(price.sku);
    if (
      scopeRank(price, currency, country, priceChannel, now) >
      (existing ? scopeRank(existing, currency, country, priceChannel, now) : -1)
    ) {
      selectedPrices.set(price.sku, price);
    }
  }

  return selectedPrices;
}
