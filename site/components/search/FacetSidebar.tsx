'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/atoms/button';
import Checkbox from '@/components/ui/atoms/checkbox';
import Input from '@/components/ui/atoms/input';
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
            <h3 className="text-sm font-semibold text-charcoal mb-3">
              {facet.label}
            </h3>
            <ul className="space-y-2">
              {facet.terms.map((term) => (
                <li key={term.term}>
                  <label className="flex items-center gap-2 text-sm text-charcoal-light cursor-pointer">
                    <Checkbox
                      type="checkbox"
                      checked={selected.includes(term.term)}
                      onChange={() => toggleValue(facet.key, term.term)}
                      className="accent-charcoal"
                    />
                    <span>{term.label ?? term.term}</span>
                    <span className="text-xs text-charcoal-light">
                      ({term.count})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3">Price</h3>
        <form
          action={applyPriceRange}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-charcoal-light">
              Min
              <Input
                type="number"
                name="minPrice"
                min="0"
                step="0.01"
                defaultValue={searchParams.get('minPrice') ?? ''}
                className="-mt-1 w-full h-9!"
                placeholder="0"
              />
            </label>
            <label className="text-xs text-charcoal-light">
              Max
              <Input
                type="number"
                name="maxPrice"
                min="0"
                step="0.01"
                defaultValue={searchParams.get('maxPrice') ?? ''}
                className="-mt-1 w-full h-9!"
                placeholder="Any"
              />
            </label>
          </div>
          <Button
            type="submit"
            size="xs"
            variant="primary"
            className="w-full"
          >
            Apply price
          </Button>
        </form>
      </div>
    </div>
  );

  if (mobileOnly) {
    return (
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setMobileOpen(true)}
          className="h-10 border-border! px-4! py-2!"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          iconPosition="left"
          icon={<FunnelIcon className="size-5" />}
        >
          Filters
        </Button>

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
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              {filters}
              <Button
                type="button"
                size="full"
                onClick={() => setMobileOpen(false)}
                className="sticky bottom-0 mt-8"
              >
                View results
              </Button>
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
