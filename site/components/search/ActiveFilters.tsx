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
      className="-mt-4 mb-8 flex flex-col gap-3 rounded-sm border border-border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-charcoal">
          Applied filters ({activeFilters.length})
        </span>
        {activeFilters.map((filter) => (
          <button
            type="button"
            key={`${filter.param}-${filter.value}`}
            onClick={() => removeFilter(filter)}
            className="cursor-pointer inline-flex max-w-full items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1.5 text-xs text-charcoal hover:bg-border"
            aria-label={`Remove ${filter.label} filter`}
          >
            <span className="truncate">{filter.label}</span>
            <span
              aria-hidden
              className="text-base leading-none"
            >
              ×
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={resetFilters}
        className="cursor-pointer shrink-0 self-start text-sm font-medium text-terra underline-offset-4 hover:underline sm:self-auto"
      >
        Reset all
      </button>
    </section>
  );
}
