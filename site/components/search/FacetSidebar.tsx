'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Facet } from '@/lib/types';

export default function FacetSidebar({ facets }: { facets: Facet[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggleValue(facetKey: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(facetKey);
    params.delete(facetKey);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => params.append(facetKey, v));
    } else {
      [...current, value].forEach((v) => params.append(facetKey, v));
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  if (facets.length === 0) return null;

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      {facets.map((facet) => {
        const selected = searchParams.getAll(facet.key);
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
    </aside>
  );
}
