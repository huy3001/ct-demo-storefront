'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Facet } from '@/lib/types';

interface ActiveFilter {
  param: string;
  value: string;
  label: string;
}

export default function ActiveFilters({ facets }: { facets: Facet[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilters: ActiveFilter[] = facets.flatMap((facet) => {
    const param = `f_${facet.key}`;
    return searchParams.getAll(param).map((value) => {
      const term = facet.terms.find((item) => item.term === value);
      return {
        param,
        value,
        label: `${facet.label}: ${term?.label ?? value}`,
      };
    });
  });

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice) activeFilters.push({ param: 'minPrice', value: minPrice, label: `Min price: ${minPrice}` });
  if (maxPrice) activeFilters.push({ param: 'maxPrice', value: maxPrice, label: `Max price: ${maxPrice}` });

  if (activeFilters.length === 0) return null;

  function navigate(params: URLSearchParams) {
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function removeFilter(filter: ActiveFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (filter.param.startsWith('f_')) {
      const remaining = params.getAll(filter.param).filter((value) => value !== filter.value);
      params.delete(filter.param);
      remaining.forEach((value) => params.append(filter.param, value));
    } else {
      params.delete(filter.param);
    }
    navigate(params);
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams.toString());
    [...params.keys()].forEach((key) => {
      if (key.startsWith('f_') || key === 'minPrice' || key === 'maxPrice') params.delete(key);
    });
    navigate(params);
  }

  return (
    <section
      aria-label="Active filters"
      className="mb-6 border-y border-border py-3 md:rounded-sm md:border md:bg-white md:px-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-charcoal">
          Applied filters ({activeFilters.length})
        </span>
        <button
          type="button"
          onClick={resetFilters}
          className="shrink-0 text-sm font-medium text-terra underline-offset-4 hover:underline md:order-3"
        >
          Reset all
        </button>
      </div>
      <div className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-1 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
        {activeFilters.map((filter) => (
          <button
            type="button"
            key={`${filter.param}-${filter.value}`}
            onClick={() => removeFilter(filter)}
            className="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1.5 text-xs text-charcoal hover:bg-border"
            aria-label={`Remove ${filter.label} filter`}
          >
            <span className="truncate">{filter.label}</span>
            <span aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x-icon lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
