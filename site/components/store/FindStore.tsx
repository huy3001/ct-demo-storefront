'use client';

import dynamic from 'next/dynamic';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import Input from '@/components/ui/atoms/input';
import type { StoreLocation } from '@/lib/ct/store';

const StoreMap = dynamic(() => import('./StoreMap'), {
  ssr: false,
  loading: () => (
    <div
      className="h-100 animate-pulse rounded-sm border border-border bg-white lg:h-145"
      aria-label="Loading store map"
    />
  ),
});

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

function formatHours(hours: Record<string, string>): string {
  const entries = Object.entries(hours);
  if (entries.length === 0) return 'Hours unavailable';

  return entries
    .map(
      ([day, value]) =>
        `${DAY_LABELS[day] ?? day}: ${value === 'closed' ? 'Closed' : value.replace('-', ' – ')}`,
    )
    .join(' · ');
}

export default function FindStore({
  stores,
  locale,
}: {
  stores: StoreLocation[];
  locale: string;
}) {
  const [query, setQuery] = useState('');
  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    if (!normalizedQuery) return stores;

    return stores.filter((store) =>
      [store.name, store.address, store.postalCode].some((value) =>
        value.toLocaleLowerCase(locale).includes(normalizedQuery),
      ),
    );
  }, [locale, query, stores]);

  return (
    <section
      className="mt-8"
      aria-labelledby="store-results-heading"
    >
      <div className="max-w-xl">
        <Input
          id="store-location-search"
          name="store-location-search"
          type="search"
          label="Search location"
          placeholder="Search by store name, address or postcode"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pr-10"
        >
          {query ? (
            <XMarkIcon
              className="absolute right-3 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-charcoal-light"
              aria-hidden="true"
              onClick={() => setQuery('')}
            />
          ) : (
            <MagnifyingGlassIcon
              className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-charcoal-light"
              aria-hidden="true"
            />
          )}
        </Input>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2
              id="store-results-heading"
              className="text-sm font-medium uppercase tracking-wide text-charcoal-light"
            >
              {filteredStores.length}{' '}
              {filteredStores.length === 1 ? 'store' : 'stores'}
            </h2>
          </div>
          {filteredStores.length > 0 ? (
            <ul
              className="max-h-137 space-y-3 overflow-y-auto pr-1"
              aria-live="polite"
            >
              {filteredStores.map((store) => (
                <li
                  key={store.id}
                  className="rounded-sm border border-border bg-white p-5"
                >
                  <h3 className="text-base font-semibold text-charcoal">
                    {store.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-charcoal-light">
                    {store.address}
                  </p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-charcoal">
                      Opening hours
                    </p>
                    <p className="mt-1 text-sm leading-6 text-charcoal-light">
                      {formatHours(store.openingHours)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="rounded-sm border border-border bg-white p-5 text-sm text-charcoal-light"
              role="status"
            >
              No stores match your search.
            </p>
          )}
        </div>
        <StoreMap stores={filteredStores} />
      </div>
    </section>
  );
}
