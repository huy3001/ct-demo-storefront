import type {
  ByProjectKeyRequestBuilder,
  ProductPagedSearchResponse,
  ProductSearchFacetExpression,
  ProductSearchRequest,
  SearchFieldType,
} from '@commercetools/platform-sdk';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type { FilterableFacetDefinition } from './product-facets';

export interface SearchFacetSelection {
  /** attribute path, e.g. "variants.attributes.color.key" or "categories" */
  field: string;
  fieldType?: SearchFieldType;
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
  facetDefinitions: FilterableFacetDefinition[];
  priceRange?: PriceRangeSelection;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'relevance';
  page?: number; // 1-based
  pageSize?: number;
}

function localeLanguage(locale: string) {
  return COUNTRY_CONFIG[locale]?.locale ?? 'en-US';
}

function buildQuery(params: ProductSearchParams) {
  const clauses: Record<string, unknown>[] = [];

  if (params.text) {
    clauses.push({
      fullText: {
        field: 'name',
        language: localeLanguage(params.locale),
        value: params.text,
        caseInsensitive: true,
      },
    });
  }

  if (params.categoryId) clauses.push({ exact: { field: 'categoriesSubTree', value: params.categoryId } });

  if (clauses.length === 0) return undefined;
  return clauses.length === 1 ? clauses[0] : { and: clauses };
}

function buildPostFilter(params: ProductSearchParams) {
  const clauses: Record<string, unknown>[] = [];

  if (params.priceRange?.min !== undefined || params.priceRange?.max !== undefined) {
    clauses.push({
      range: {
        field: 'variants.prices.centAmount',
        fieldType: 'number',
        gte: params.priceRange?.min,
        lte: params.priceRange?.max,
      },
    });
  }

  for (const facet of params.facets ?? []) {
    if (!facet.values.length) continue;
    const values = facet.fieldType?.includes('boolean')
      ? facet.values.map((value) => value === 'true')
      : facet.values;
    clauses.push({
      exact: {
        field: facet.field,
        ...(facet.fieldType ? { fieldType: facet.fieldType } : {}),
        language: params.locale,
        values,
      },
    });
  }

  if (clauses.length === 0) return undefined;
  return clauses.length === 1 ? clauses[0] : { and: clauses };
}

function buildSort(sort: ProductSearchParams['sort'], locale: string) {
  switch (sort) {
    case 'price-asc':
      return [{ field: 'variants.prices.centAmount', order: 'asc' as const }];
    case 'price-desc':
      return [{ field: 'variants.prices.centAmount', order: 'desc' as const }];
    case 'name-asc':
      return [{ field: 'name', language: localeLanguage(locale), order: 'asc' as const }];
    case 'name-desc':
      return [{ field: 'name', language: localeLanguage(locale), order: 'desc' as const }];
    default:
      return undefined; // relevance / default score ordering
  }
}

// Category is always available. Attribute facets come from searchable ProductType definitions;
// retain a category-only fallback for catalogs whose search index trails a schema update.
function buildFacetExpressions(
  definitions: FilterableFacetDefinition[],
  locale: string
): ProductSearchFacetExpression[] {
  return definitions.map((facet) => ({
    distinct: {
      name: facet.key,
      field: facet.field,
      ...(facet.fieldType ? { fieldType: facet.fieldType } : {}),
      language: locale,
      limit: 50,
    },
  }));
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
    postFilter: buildPostFilter(params),
    sort: buildSort(params.sort, params.locale),
    limit: pageSize,
    offset: (page - 1) * pageSize,
    markMatchingVariants: true,
    productProjectionParameters: {
      priceCurrency: currency,
      priceCountry: country,
      localeProjection: [params.locale],
    },
  };

  const categoryFacet = params.facetDefinitions.filter((facet) => facet.key === 'category');
  const attempts = [
    buildFacetExpressions(params.facetDefinitions, params.locale),
    buildFacetExpressions(categoryFacet, params.locale),
    [],
  ];
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
