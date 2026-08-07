import { notFound } from 'next/navigation';
import { getCategoryBySlug, getCategoryTree } from '@/lib/ct/category';
import { runProductSearch } from '@/lib/ct/search-page';
import SearchResultsView from '@/components/search/SearchResultsView';
import { getFilterableFacets } from '@/lib/ct/product-facets';
import type { Category } from '@/lib/types';

const SORTS = ['price-asc', 'price-desc', 'name-asc', 'name-desc', 'relevance'] as const;

function categoryLabels(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.flatMap((category) => [
    [category.id, category.name],
    ...Object.entries(categoryLabels(category.children ?? [])),
  ]));
}

function priceInCents(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue?.trim()) return undefined;
  const amount = Number(rawValue);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : undefined;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;

  const [category, categories] = await Promise.all([
    slug === 'all' ? Promise.resolve(null) : getCategoryBySlug(slug, locale),
    getCategoryTree(locale),
  ]);
  if (slug !== 'all' && !category) notFound();

  const page = Math.max(1, Number.parseInt(String(sp.page ?? '1'), 10) || 1);
  const requestedSort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sort = SORTS.find((value) => value === requestedSort);

  const facetDefinitions = await getFilterableFacets(locale);
  const facets = facetDefinitions.map((attr) => ({
    field: attr.field,
    fieldType: attr.fieldType,
    values: ([] as string[]).concat(sp[`f_${attr.key}`] ?? []),
  })).filter((f) => f.values.length);

  const result = await runProductSearch({
    locale,
    categoryId: category?.id,
    sort,
    page,
    pageSize: 24,
    facets,
    facetDefinitions,
    priceRange: { min: priceInCents(sp.minPrice), max: priceInCents(sp.maxPrice) },
  });

  return (
    <SearchResultsView
      result={result}
      page={page}
      locale={locale}
      title={category?.name ?? 'All products'}
      categoryLabels={categoryLabels(categories)}
    />
  );
}
