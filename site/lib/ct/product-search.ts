import type { ByProjectKeyRequestBuilder, ProductPagedSearchResponse, ProductSearchRequest } from '@commercetools/platform-sdk';
import { COUNTRY_CONFIG } from '@/lib/utils';

export interface SearchFacetSelection {
  /** attribute path, e.g. "variants.attributes.color.key" or "categories.id" */
  field: string;
  values: string[];
}

export interface PriceRangeSelection {
  min?: number; // in cents
  max?: number; // in cents
}

export interface ProductSearchParams {
  locale: string;
  text?: string;
  categoryId?: string;
  facets?: SearchFacetSelection[];
  priceRange?: PriceRangeSelection;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'relevance';
  page?: number; // 1-based
  pageSize?: number;
}

export const FACETABLE_ATTRIBUTES: Array<{ key: string; label: string; field: string }> = [
  { key: 'color', label: 'Color', field: 'variants.attributes.color.key' },
  { key: 'size', label: 'Size', field: 'variants.attributes.size.key' },
  { key: 'brand', label: 'Brand', field: 'variants.attributes.brand' },
];

function localeLanguage(locale: string) {
  return (COUNTRY_CONFIG[locale]?.locale ?? 'en-US').split('-')[0];
}

function buildQuery(params: ProductSearchParams) {
  const clauses: Record<string, unknown>[] = [];

  if (params.text) {
    clauses.push({
      fullText: { field: 'name', language: localeLanguage(params.locale), value: params.text },
    });
  }

  if (params.categoryId) {
    clauses.push({ exact: { field: 'categories.id', value: params.categoryId } });
  }

  if (params.priceRange?.min !== undefined || params.priceRange?.max !== undefined) {
    clauses.push({
      range: {
        field: 'variants.prices.centAmount',
        gte: params.priceRange?.min,
        lte: params.priceRange?.max,
      },
    });
  }

  for (const facet of params.facets ?? []) {
    if (!facet.values.length) continue;
    clauses.push({ exact: { field: facet.field, values: facet.values } });
  }

  if (clauses.length === 0) return undefined;
  return clauses.length === 1 ? clauses[0] : { and: clauses };
}

function buildSort(sort: ProductSearchParams['sort']) {
  switch (sort) {
    case 'price-asc':
      return [{ field: 'variants.prices.centAmount', order: 'asc' as const }];
    case 'price-desc':
      return [{ field: 'variants.prices.centAmount', order: 'desc' as const }];
    case 'name-asc':
      return [{ field: 'name', order: 'asc' as const }];
    case 'name-desc':
      return [{ field: 'name', order: 'desc' as const }];
    default:
      return undefined; // relevance / default score ordering
  }
}

// `categories.id` is always a valid searchable/facetable field regardless of the project's
// product type schema, so it's always requested. The attribute-based facets in
// FACETABLE_ATTRIBUTES depend on the project's actual product type having matching attributes
// (e.g. "color", "size", "brand") — if the project's schema differs (or has no product types
// at all), the Search API rejects the whole request with a 400 "Unknown field" error. To stay
// resilient across arbitrary catalogs, we optimistically request all facets first and fall back
// to progressively fewer facets if the API rejects the field set.
const CATEGORY_FACET = { distinct: { name: 'categories', field: 'categories.id', fieldType: 'text' as const } };

function buildFacetExpressions(includeAttributeFacets: boolean) {
  const facets = [CATEGORY_FACET];
  if (includeAttributeFacets) {
    facets.push(
      ...FACETABLE_ATTRIBUTES.map((attr) => ({
        distinct: { name: attr.key, field: attr.field, fieldType: 'text' as const },
      }))
    );
  }
  return facets;
}

function isUnknownFieldError(error: unknown): boolean {
  const message = (error as { message?: string; body?: { message?: string } })?.message
    ?? (error as { body?: { message?: string } })?.body?.message;
  return typeof message === 'string' && message.includes('Unknown field');
}

/** Runs a query against the commercetools Product Search API (`POST /{projectKey}/products/search`). */
export async function searchProducts(
  apiRoot: ByProjectKeyRequestBuilder,
  params: ProductSearchParams
): Promise<ProductPagedSearchResponse> {
  const { currency, country } = COUNTRY_CONFIG[params.locale] ?? COUNTRY_CONFIG['en-US'];
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;

  const baseBody = {
    query: buildQuery(params),
    sort: buildSort(params.sort),
    limit: pageSize,
    offset: (page - 1) * pageSize,
    markMatchingVariants: true,
    productProjectionParameters: {
      priceCurrency: currency,
      priceCountry: country,
      localeProjection: [params.locale],
    },
  };

  const attempts = [buildFacetExpressions(true), buildFacetExpressions(false), []];
  let lastError: unknown;
  for (const facets of attempts) {
    const body: ProductSearchRequest = { ...baseBody, facets };
    try {
      const { body: result } = await apiRoot.products().search().post({ body }).execute();
      return result;
    } catch (error) {
      lastError = error;
      if (!isUnknownFieldError(error)) throw error;
    }
  }
  throw lastError;
}
