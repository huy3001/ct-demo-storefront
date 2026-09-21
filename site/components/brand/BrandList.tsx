'use client';

import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import type { ProductBrand } from '@/lib/types';

export default function BrandList({
  brands,
  locale,
}: {
  brands: ProductBrand[];
  locale: string;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const filteredBrands =
    normalizedQuery.length >= 3
      ? brands.filter((brand) =>
          brand.name.toLocaleLowerCase(locale).includes(normalizedQuery),
        )
      : brands;

  return (
    <section
      className="mt-8"
      aria-labelledby="brand-list-heading"
    >
      <h2
        id="brand-list-heading"
        className="sr-only"
      >
        All brands
      </h2>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative max-w-xl">
          <label
            htmlFor="brand-search"
            className="sr-only"
          >
            Search brands
          </label>
          <input
            id="brand-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brands"
            className="w-full rounded-sm border border-border bg-white py-3 pl-4 pr-12 text-sm text-charcoal outline-none focus:border-terra"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear brand search"
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-charcoal-light hover:text-terra"
            >
              <XMarkIcon
                className="size-5"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <p
          className="text-sm text-charcoal-light"
          aria-live="polite"
        >
          {filteredBrands.length}{' '}
          {filteredBrands.length === 1 ? 'brand' : 'brands'}
        </p>
      </div>

      {filteredBrands.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBrands.map((brand) => {
            const searchQuery = new URLSearchParams({
              q: brand.name,
              f_productBrand: brand.name,
            });

            return (
              <li key={brand.name}>
                <Link
                  href={`/search?${searchQuery.toString()}`}
                  locale={locale}
                  aria-label={`Shop ${brand.name}`}
                  className="group flex h-28 items-center justify-center rounded-sm border border-border bg-white p-5 transition-colors hover:border-terra"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      width={160}
                      height={64}
                      className="h-14 w-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-center text-base font-semibold text-charcoal">
                      {brand.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-charcoal-light">
          No brands match your search.
        </p>
      )}
    </section>
  );
}
