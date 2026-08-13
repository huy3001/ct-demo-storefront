'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Facet } from '@/lib/types';

export default function FacetSidebar({
  facets,
  mobileOnly = false,
  desktopOnly = false,
}: {
  facets: Facet[];
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

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

  const filters = (
    <div className="space-y-8">
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
    </div>
  );

  if (mobileOnly) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-white px-4 py-2 text-sm font-medium text-charcoal"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
        >
          <span aria-hidden>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sliders-horizontal-icon lucide-sliders-horizontal"
            >
              <path d="M10 5H3" />
              <path d="M12 19H3" />
              <path d="M14 3v4" />
              <path d="M16 17v4" />
              <path d="M21 12h-9" />
              <path d="M21 19h-5" />
              <path d="M21 5h-7" />
              <path d="M8 10v4" />
              <path d="M8 12H3" />
            </svg>
          </span>
          Filters
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
            />
            <aside className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-sm bg-cream p-4 shadow-sm">
              <div className="sticky -top-5 z-10 mb-6 flex items-center justify-between border-b border-border bg-cream py-4">
                <h2 className="text-lg font-semibold text-charcoal">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white"
                  aria-label="Close filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                </button>
              </div>
              {filters}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="sticky bottom-0 mt-8 w-full rounded-sm bg-charcoal px-4 py-3 text-sm font-medium text-white"
              >
                View results
              </button>
            </aside>
          </div>
        )}
      </div>
    );
  }

  if (desktopOnly) {
    return <aside className="hidden w-56 shrink-0 md:block">{filters}</aside>;
  }

  return <aside className="w-full md:w-56 shrink-0">{filters}</aside>;
}
