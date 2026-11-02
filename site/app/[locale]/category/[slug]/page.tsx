import { notFound } from 'next/navigation';
import { getCategoryBySlug, getCategoryTree } from '@/lib/ct/category';
import { runProductSearch } from '@/lib/ct/search-page';
import SearchResultsView from '@/components/search/SearchResultsView';
import { getFilterableFacets } from '@/lib/ct/product-facets';
import type { Category } from '@/lib/types';
import { categoryIdsByName, categoryLabels, isColorCodeFacet } from '@/lib/search-filters';
import { parseProductListingParams } from '@/lib/search-params';

function findCategory(categories: Category[], id: string): Category | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    const child = findCategory(category.children ?? [], id);
    if (child) return child;
  }
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

  const { page, pageSize, sort } = parseProductListingParams(sp);

  const facetDefinitions = (await getFilterableFacets(locale)).filter((facet) => !isColorCodeFacet(facet.key));
  const idsByCategoryName = categoryIdsByName(categories);
  const facets = facetDefinitions.map((attr) => ({
    field: attr.field,
    fieldType: attr.fieldType,
    values: ([] as string[])
      .concat(sp[`f_${attr.key}`] ?? [])
      .map((value) => attr.key === 'category' ? idsByCategoryName[value] ?? value : value),
  })).filter((f) => f.values.length);

  const result = await runProductSearch({
    locale,
    categoryId: slug === 'sale' ? undefined : category?.id,
    discountedOnly: slug === 'sale',
    sort,
    page,
    pageSize,
    facets,
    facetDefinitions,
    priceRange: { min: priceInCents(sp.minPrice), max: priceInCents(sp.maxPrice) },
  });
  const categoryWithChildren = category ? findCategory(categories, category.id) : undefined;

  return (
    <SearchResultsView
      result={result}
      page={page}
      locale={locale}
      title={category?.name ?? 'All products'}
      description={category?.description}
      subcategories={category ? categoryWithChildren?.children : categories}
      categoryLabels={categoryLabels(categories)}
      useCategoryNamesInFilters
    />
  );
}
