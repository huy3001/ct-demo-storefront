import { runProductSearch } from '@/lib/ct/search-page';
import SearchResultsView from '@/components/search/SearchResultsView';
import { getFilterableFacets } from '@/lib/ct/product-facets';
import { getCategoryTree } from '@/lib/ct/category';
import { categoryIdsByName, categoryLabels, isColorCodeFacet } from '@/lib/search-filters';
import { parseProductListingParams } from '@/lib/search-params';

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
  const { page, pageSize, sort } = parseProductListingParams(sp);

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
    ? await runProductSearch({
        locale,
        text: query,
        sort,
        page,
        pageSize,
        facets,
        priceRange,
        facetDefinitions,
      })
    : { products: [], total: 0, offset: 0, limit: pageSize, facets: [] };

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
