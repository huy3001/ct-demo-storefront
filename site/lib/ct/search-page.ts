import { getCatalogApiRoot } from './client';
import { searchProducts, FACETABLE_ATTRIBUTES, type ProductSearchParams } from './product-search';
import { mapProductProjection } from '@/lib/mappers/product';
import type { SearchResult } from '@/lib/types';

export interface RunSearchParams extends ProductSearchParams {
  page: number;
  pageSize: number;
}

export async function runProductSearch(params: RunSearchParams): Promise<SearchResult> {
  const apiRoot = getCatalogApiRoot();
  const response = await searchProducts(apiRoot, params);

  const products = response.results
    .map((r) => r.productProjection)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => mapProductProjection(p, params.locale));

  const facets = response.facets
    .map((facetResult) => {
      const def = FACETABLE_ATTRIBUTES.find((a) => a.key === facetResult.name);
      const buckets = (facetResult as { buckets?: Array<{ key: string; count: number }> }).buckets ?? [];
      if (!def || buckets.length === 0) return null;
      return {
        key: def.key,
        label: def.label,
        terms: buckets.map((b) => ({ term: b.key, count: b.count })),
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
