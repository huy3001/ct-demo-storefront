import { getCatalogApiRoot } from './client';
import { searchProducts, type ProductSearchParams } from './product-search';
import { mapProductProjection } from '@/lib/mappers/product';
import type { SearchResult } from '@/lib/types';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { getStandalonePricesBySku } from './standalone-prices';
import { getStorePriceChannel } from './store-channel';

export interface RunSearchParams extends ProductSearchParams {
  page: number;
  pageSize: number;
}

export async function runProductSearch(params: RunSearchParams): Promise<SearchResult> {
  const apiRoot = getCatalogApiRoot();
  const priceChannel = await getStorePriceChannel(apiRoot, params.locale);
  const response = await searchProducts(apiRoot, { ...params, priceChannel });
  const projections = response.results
    .map((result) => result.productProjection)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const { currency, country } =
    COUNTRY_CONFIG[params.locale] ?? COUNTRY_CONFIG['en-US'];
  const standalonePricesBySku = await getStandalonePricesBySku(
    apiRoot,
    projections,
    currency,
    country,
    priceChannel,
  );

  const products = projections.map((product) =>
    mapProductProjection(product, params.locale, standalonePricesBySku),
  );

  const facets = response.facets
    .map((facetResult) => {
      const def = params.facetDefinitions.find((a) => a.key === facetResult.name);
      const buckets = (facetResult as { buckets?: Array<{ key: string; count: number }> }).buckets ?? [];
      if (!def || buckets.length === 0) return null;
      return {
        key: def.key,
        label: def.label,
        terms: buckets.map((b) => ({ term: b.key, count: b.count, label: def.termLabels?.[b.key] })),
      };
    })
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return {
    products,
    total: response.total,
    offset: response.offset,
    limit: response.limit,
    facets,
  };
}
