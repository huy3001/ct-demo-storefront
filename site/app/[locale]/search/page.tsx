import { runProductSearch } from '@/lib/ct/search-page';
import SearchResultsView from '@/components/search/SearchResultsView';
import { FACETABLE_ATTRIBUTES } from '@/lib/ct/product-search';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const query = (sp.q as string | undefined) ?? '';
  const page = Number(sp.page ?? 1) || 1;
  const sort = (sp.sort as string | undefined) as
    | 'price-asc'
    | 'price-desc'
    | 'name-asc'
    | 'name-desc'
    | 'relevance'
    | undefined;

  const facets = FACETABLE_ATTRIBUTES.map((attr) => ({
    field: attr.field,
    values: ([] as string[]).concat(sp[attr.key] ?? []),
  })).filter((f) => f.values.length);

  const result = query
    ? await runProductSearch({ locale, text: query, sort, page, pageSize: 24, facets })
    : { products: [], total: 0, offset: 0, limit: 24, facets: [] };

  return (
    <SearchResultsView
      result={result}
      page={page}
      locale={locale}
      title={query ? `Results for "${query}"` : 'Search'}
    />
  );
}
