import { runProductSearch } from '@/lib/ct/search-page';
import SearchResultsView from '@/components/search/SearchResultsView';
import { getFilterableFacets } from '@/lib/ct/product-facets';
import { getCategoryTree } from '@/lib/ct/category';
import { categoryIdsByName, categoryLabels, isColorCodeFacet } from '@/lib/search-filters';

const SORTS = ['price-asc', 'price-desc', 'name-asc', 'name-desc', 'relevance'] as const;

function priceInCents(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue?.trim()) return undefined;
  const amount = Number(rawValue);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : undefined;
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const queryValue = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const query = queryValue?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(String(sp.page ?? '1'), 10) || 1);
  const requestedSort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sort = SORTS.find((value) => value === requestedSort);

  const [allFacetDefinitions, categories] = await Promise.all([
    getFilterableFacets(locale),
    getCategoryTree(locale),
  ]);
  const facetDefinitions = allFacetDefinitions.filter((facet) => !isColorCodeFacet(facet.key));
  const idsByCategoryName = categoryIdsByName(categories);
  const facets = facetDefinitions.map((attr) => ({
    field: attr.field,
    fieldType: attr.fieldType,
    values: ([] as string[])
      .concat(sp[`f_${attr.key}`] ?? [])
      .map((value) => attr.key === 'category' ? idsByCategoryName[value] ?? value : value),
  })).filter((f) => f.values.length);

  const priceRange = { min: priceInCents(sp.minPrice), max: priceInCents(sp.maxPrice) };

  const result = query
    ? await runProductSearch({ locale, text: query, sort, page, pageSize: 24, facets, priceRange, facetDefinitions })
    : { products: [], total: 0, offset: 0, limit: 24, facets: [] };

  return (
    <SearchResultsView
      result={result}
      page={page}
      locale={locale}
      title={query ? `Results for "${query}"` : 'Search'}
      categoryLabels={categoryLabels(categories)}
      useCategoryNamesInFilters
    />
  );
}
