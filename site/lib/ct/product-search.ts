import type {
  ByProjectKeyRequestBuilder,
  ProductProjection,
  ProductPagedSearchResponse,
  ProductSearchFacetExpression,
  ProductSearchRequest,
  SearchFieldType,
} from '@commercetools/platform-sdk';
import { COUNTRY_CONFIG, getLocalizedString } from '@/lib/utils';
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
  priceChannel?: string;
  text?: string;
  categoryId?: string;
  discountedOnly?: boolean;
  facets?: SearchFacetSelection[];
  facetDefinitions: FilterableFacetDefinition[];
  priceRange?: PriceRangeSelection;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'relevance';
  page?: number; // 1-based
  pageSize?: number;
}

const DEFAULT_TEXT_LANGUAGE = 'en-US';
const FALLBACK_FETCH_PAGE_SIZE = 200;
const MAX_FALLBACK_PRODUCTS = 2000;

function localeLanguage(locale: string) {
  const resolvedLocale =
    COUNTRY_CONFIG[locale]?.locale ?? DEFAULT_TEXT_LANGUAGE;
  return resolvedLocale.split('-')[0];
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [
    ...new Set(
      values.filter((value): value is string => Boolean(value?.trim())),
    ),
  ];
}

function textLanguageCandidates(locale: string): string[] {
  const resolvedLocale = COUNTRY_CONFIG[locale]?.locale ?? locale;
  return uniqueStrings([
    resolvedLocale,
    locale,
    DEFAULT_TEXT_LANGUAGE,
    localeLanguage(locale),
  ]);
}

function projectionLocales(locale: string): string[] {
  const resolvedLocale = COUNTRY_CONFIG[locale]?.locale ?? locale;
  return uniqueStrings([resolvedLocale, locale, DEFAULT_TEXT_LANGUAGE]);
}

function buildQuery(
  params: ProductSearchParams,
  textLanguage = DEFAULT_TEXT_LANGUAGE,
) {
  const clauses: Record<string, unknown>[] = [];

  if (params.text) {
    clauses.push({
      or: [
        {
          fullText: {
            field: 'name',
            language: textLanguage,
            value: params.text,
          },
        },
        {
          fullText: {
            field: 'variants.attributes.productBrand',
            fieldType: 'text',
            value: params.text,
          },
        },
      ],
    });
  }

  if (params.categoryId)
    clauses.push({
      exact: { field: 'categoriesSubTree', value: params.categoryId },
    });

  if (params.discountedOnly) {
    const { currency } =
      COUNTRY_CONFIG[params.locale] ?? COUNTRY_CONFIG['en-US'];
    clauses.push(
      { exact: { field: 'variants.prices.discounted', value: true } },
      { exact: { field: 'variants.prices.currencyCode', value: currency } },
    );
  }

  if (
    params.priceRange?.min !== undefined ||
    params.priceRange?.max !== undefined
  ) {
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

function hasStructuredFilters(params: ProductSearchParams): boolean {
  return Boolean(
    params.categoryId ||
    params.discountedOnly ||
    params.priceRange?.min !== undefined ||
    params.priceRange?.max !== undefined ||
    (params.facets?.length ?? 0) > 0,
  );
}

function readProductBrand(product: ProductProjection, locale: string): string {
  const value = product.masterVariant.attributes?.find(
    (attribute) => attribute.name === 'productBrand',
  )?.value;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return getLocalizedString(value as Record<string, string>, locale);
  }
  return '';
}

function productMatchesPartialQuery(
  product: ProductProjection,
  query: string,
  locale: string,
): boolean {
  const normalizedQuery = query.toLocaleLowerCase(DEFAULT_TEXT_LANGUAGE);
  const localizedName = getLocalizedString(
    product.name,
    locale,
  ).toLocaleLowerCase(DEFAULT_TEXT_LANGUAGE);
  const fallbackName = getLocalizedString(
    product.name,
    DEFAULT_TEXT_LANGUAGE,
  ).toLocaleLowerCase(DEFAULT_TEXT_LANGUAGE);
  const brand = readProductBrand(product, locale).toLocaleLowerCase(
    DEFAULT_TEXT_LANGUAGE,
  );
  return (
    localizedName.includes(normalizedQuery) ||
    fallbackName.includes(normalizedQuery) ||
    brand.includes(normalizedQuery)
  );
}

function productPriceCentAmount(product: ProductProjection): number {
  return (
    product.masterVariant.price?.value.centAmount ?? Number.MAX_SAFE_INTEGER
  );
}

function sortFallbackProducts(
  products: ProductProjection[],
  params: ProductSearchParams,
): ProductProjection[] {
  const sorted = [...products];
  switch (params.sort) {
    case 'price-asc':
      return sorted.sort(
        (a, b) => productPriceCentAmount(a) - productPriceCentAmount(b),
      );
    case 'price-desc':
      return sorted.sort(
        (a, b) => productPriceCentAmount(b) - productPriceCentAmount(a),
      );
    case 'name-asc':
      return sorted.sort((a, b) =>
        getLocalizedString(a.name, params.locale).localeCompare(
          getLocalizedString(b.name, params.locale),
        ),
      );
    case 'name-desc':
      return sorted.sort((a, b) =>
        getLocalizedString(b.name, params.locale).localeCompare(
          getLocalizedString(a.name, params.locale),
        ),
      );
    default:
      return sorted;
  }
}

async function partialMatchFallbackSearch(
  apiRoot: ByProjectKeyRequestBuilder,
  params: ProductSearchParams,
  page: number,
  pageSize: number,
  currency: string,
  country: string,
): Promise<ProductPagedSearchResponse> {
  const collected: ProductProjection[] = [];
  const locales = projectionLocales(params.locale);
  let offset = 0;
  let total = Number.MAX_SAFE_INTEGER;

  while (offset < total && collected.length < MAX_FALLBACK_PRODUCTS) {
    const { body } = await apiRoot
      .productProjections()
      .get({
        queryArgs: {
          limit: FALLBACK_FETCH_PAGE_SIZE,
          offset,
          staged: false,
          withTotal: true,
          priceCurrency: currency,
          priceCountry: country,
          ...(params.priceChannel ? { priceChannel: params.priceChannel } : {}),
          localeProjection: locales,
        },
      })
      .execute();

    collected.push(...body.results);
    total = body.total ?? offset + body.count;
    if (!body.count) break;
    offset += body.count;
  }

  const matched = sortFallbackProducts(
    collected.filter((product) =>
      productMatchesPartialQuery(product, params.text ?? '', params.locale),
    ),
    params,
  );
  const responseOffset = (page - 1) * pageSize;
  const paged = matched.slice(responseOffset, responseOffset + pageSize);

  return {
    total: matched.length,
    offset: responseOffset,
    limit: pageSize,
    facets: [],
    results: paged.map((product) => ({
      id: product.id,
      productProjection: product,
      matchingVariants: {
        allMatched: true,
        matchedVariants: [],
      },
    })),
  } as ProductPagedSearchResponse;
}

/** Runs a query against the commercetools Product Search API (`POST /{projectKey}/products/search`). */
export async function searchProducts(
  apiRoot: ByProjectKeyRequestBuilder,
  params: ProductSearchParams
): Promise<ProductPagedSearchResponse> {
  const { currency, country } = COUNTRY_CONFIG[params.locale] ?? COUNTRY_CONFIG['en-US'];
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;

  const categoryFacet = params.facetDefinitions.filter(
    (facet) => facet.key === 'category',
  );
  const facetAttempts = [
    buildFacetExpressions(params.facetDefinitions, params.locale),
    buildFacetExpressions(categoryFacet, params.locale),
    [],
  ];

  const languages = params.text
    ? textLanguageCandidates(params.locale)
    : [undefined];
  const locales = projectionLocales(params.locale);
  let lastError: unknown;
  let zeroResult: ProductPagedSearchResponse | undefined;

  for (const language of languages) {
    const baseBody = {
      query: buildQuery(params, language ?? DEFAULT_TEXT_LANGUAGE),
      sort: buildSort(params.sort, params.locale),
      limit: pageSize,
      offset: (page - 1) * pageSize,
      markMatchingVariants: true,
      productProjectionParameters: {
        priceCurrency: currency,
        priceCountry: country,
        ...(params.priceChannel ? { priceChannel: params.priceChannel } : {}),
        localeProjection: locales,
      },
    };

    for (const facets of facetAttempts) {
      const body: ProductSearchRequest = { ...baseBody, facets };
      try {
        const { body: result } = await apiRoot
          .products()
          .search()
          .post({ body })
          .execute();
        if (!params.text || result.total > 0) return result;
        if (!zeroResult) zeroResult = result;
        break;
      } catch (error) {
        lastError = error;
        if (!isUnknownFieldError(error)) throw error;
      }
    }
  }

  if (params.text && !hasStructuredFilters(params)) {
    const fallbackResult = await partialMatchFallbackSearch(
      apiRoot,
      params,
      page,
      pageSize,
      currency,
      country,
    );
    if (fallbackResult.total > 0) return fallbackResult;
  }

  if (zeroResult) return zeroResult;
  if (lastError) throw lastError;

  throw new Error('Product search failed with no response');
}
