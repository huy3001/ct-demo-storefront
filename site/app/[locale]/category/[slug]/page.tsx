import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/ct/category';
import { runProductSearch } from '@/lib/ct/search-page';
import SearchResultsView from '@/components/search/SearchResultsView';
import { FACETABLE_ATTRIBUTES } from '@/lib/ct/product-search';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;

  const category = slug === 'all' ? null : await getCategoryBySlug(slug, locale);
  if (slug !== 'all' && !category) notFound();

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

  const result = await runProductSearch({
    locale,
    categoryId: category?.id,
    sort,
    page,
    pageSize: 24,
    facets,
  });

  return (
    <SearchResultsView result={result} page={page} locale={locale} title={category?.name ?? 'All products'} />
  );
}
