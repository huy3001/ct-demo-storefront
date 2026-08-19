import type { SearchResult } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import FacetSidebar from './FacetSidebar';
import SortSelect from './SortSelect';
import Pagination from './Pagination';
import ActiveFilters from './ActiveFilters';
import ProductsPerPageSelect from './ProductsPerPageSelect';
import Link from 'next/link';
import type { Category } from '@/lib/types';

export default function SearchResultsView({
  result,
  page,
  locale,
  title,
  description,
  subcategories = [],
  categoryLabels = {},
  useCategoryNamesInFilters = false,
}: {
  result: SearchResult;
  page: number;
  locale: string;
  title: string;
  description?: string;
  subcategories?: Category[];
  categoryLabels?: Record<string, string>;
  useCategoryNamesInFilters?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  const facets = result.facets.map((facet) =>
    facet.key === 'category'
      ? {
          ...facet,
          terms: facet.terms.map((term) => ({
            ...term,
            term: useCategoryNamesInFilters ? categoryLabels[term.term] ?? term.term : term.term,
            label: categoryLabels[term.term] ?? term.label,
          })),
        }
      : facet,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-charcoal-light">
            {description}
          </p>
        )}
        {subcategories.length > 0 && (
          <nav
            aria-label="Subcategories"
            className="mt-5 flex flex-wrap gap-2"
          >
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/${locale}/category/${subcategory.slug}`}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm text-charcoal hover:border-terra hover:text-terra"
              >
                {subcategory.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {result.products.length === 0 ? (
        <p className="text-charcoal-light py-16 text-center">
          No products found.
        </p>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between gap-4 md:hidden">
            <FacetSidebar
              facets={facets}
              mobileOnly
            />
            <SortSelect />
          </div>

          <ActiveFilters facets={facets} />

          <div className="flex gap-10">
            <FacetSidebar
              facets={facets}
              desktopOnly
            />
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ProductsPerPageSelect value={result.limit} />
                  <p className="text-sm text-charcoal-light">
                    {result.limit <= result.total
                      ? `of ${result.total} products`
                      : 'products'}
                  </p>
                </div>
                <div className="hidden md:block">
                  <SortSelect />
                </div>
              </div>
              <ProductGrid
                products={result.products}
                locale={locale}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
