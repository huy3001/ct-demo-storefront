import type { SearchResult } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import FacetSidebar from './FacetSidebar';
import SortSelect from './SortSelect';
import Pagination from './Pagination';

export default function SearchResultsView({
  result,
  page,
  locale,
  title,
  categoryLabels = {},
}: {
  result: SearchResult;
  page: number;
  locale: string;
  title: string;
  categoryLabels?: Record<string, string>;
}) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  const facets = result.facets.map((facet) =>
    facet.key === 'category'
      ? {
          ...facet,
          terms: facet.terms.map((term) => ({ ...term, label: categoryLabels[term.term] ?? term.label })),
        }
      : facet
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <SortSelect />
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <FacetSidebar facets={facets} />
        <div className="flex-1">
          <p className="text-sm text-charcoal-light mb-6">{result.total} results</p>
          <ProductGrid products={result.products} locale={locale} />
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
