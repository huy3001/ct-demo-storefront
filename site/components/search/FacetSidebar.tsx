'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Facet } from '@/lib/types';

export default function FacetSidebar({ facets }: { facets: Facet[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggleValue(facetKey: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const paramName = `f_${facetKey}`;
    const current = params.getAll(paramName);
    params.delete(paramName);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => params.append(paramName, v));
    } else {
      [...current, value].forEach((v) => params.append(paramName, v));
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    const min = String(formData.get('minPrice') ?? '').trim();
    const max = String(formData.get('maxPrice') ?? '').trim();

    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      {facets.map((facet) => {
        const selected = searchParams.getAll(`f_${facet.key}`);
        return (
          <div key={facet.key}>
            <h3 className="text-sm font-semibold text-charcoal mb-3">{facet.label}</h3>
            <ul className="space-y-2">
              {facet.terms.map((term) => (
                <li key={term.term}>
                  <label className="flex items-center gap-2 text-sm text-charcoal-light cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(term.term)}
                      onChange={() => toggleValue(facet.key, term.term)}
                      className="accent-terra"
                    />
                    <span>{term.label ?? term.term}</span>
                    <span className="text-xs text-charcoal-light">({term.count})</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3">Price</h3>
        <form action={applyPriceRange} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-charcoal-light">
              Min
              <input
                type="number"
                name="minPrice"
                min="0"
                step="0.01"
                defaultValue={searchParams.get('minPrice') ?? ''}
                className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1.5 text-sm text-charcoal"
                placeholder="0"
              />
            </label>
            <label className="text-xs text-charcoal-light">
              Max
              <input
                type="number"
                name="maxPrice"
                min="0"
                step="0.01"
                defaultValue={searchParams.get('maxPrice') ?? ''}
                className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1.5 text-sm text-charcoal"
                placeholder="Any"
              />
            </label>
          </div>
          <button type="submit" className="w-full rounded-sm bg-charcoal px-3 py-2 text-sm text-white hover:bg-terra">
            Apply price
          </button>
        </form>
      </div>
    </aside>
  );
}
