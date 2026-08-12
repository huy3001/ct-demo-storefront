'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { SearchSuggestions } from '@/lib/ct/search-suggestions';

const EMPTY_SUGGESTIONS: SearchSuggestions = { categories: [], products: [] };

export default function SearchForm({ locale, className = '' }: { locale: string; className?: string }) {
  const router = useRouter();
  const suggestionsId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestions>(EMPTY_SUGGESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: trimmedQuery, locale });
        const response = await fetch(`/api/search/suggestions?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load suggestions');
        setSuggestions(await response.json());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSuggestions(EMPTY_SUGGESTIONS);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [locale, query]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function goToSearchResults() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setIsOpen(false);
    router.push(`/${locale}/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    goToSearchResults();
  }

  const hasSuggestions = suggestions.categories.length > 0 || suggestions.products.length > 0;
  const showDropdown = isOpen && query.trim().length >= 3;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      <form
        onSubmit={submitSearch}
        role="search"
      >
        <div className="relative">
          <input
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 3) {
                setSuggestions(EMPTY_SUGGESTIONS);
                setIsLoading(false);
              }
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            type="search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={suggestionsId}
            aria-autocomplete="list"
            placeholder="Enter your search…"
            className="w-full rounded-sm border border-border bg-white py-2 pl-3 pr-10 text-sm outline-none focus:border-terra"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-charcoal-light hover:text-terra"
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
              className="lucide lucide-search-icon lucide-search"
            >
              <path d="m21 21-4.34-4.34" />
              <circle
                cx="11"
                cy="11"
                r="8"
              />
            </svg>
          </button>
        </div>
      </form>

      {showDropdown && (
        <div
          id={suggestionsId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-sm border border-border bg-white shadow-lg md:min-w-[26rem]"
        >
          {isLoading && !hasSuggestions ? (
            <p className="px-4 py-5 text-sm text-charcoal-light">Searching…</p>
          ) : hasSuggestions ? (
            <div className="p-2">
              {suggestions.categories.length > 0 && (
                <div>
                  <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal-light">
                    Categories
                  </p>
                  {suggestions.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      locale={locale}
                      role="option"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-charcoal hover:bg-cream-dark hover:text-terra"
                    >
                      <span aria-hidden="true">↗</span>
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div
                  className={
                    suggestions.categories.length
                      ? 'mt-2 border-t border-border pt-2'
                      : ''
                  }
                >
                  <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal-light">
                    Products
                  </p>
                  {suggestions.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      locale={locale}
                      role="option"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-sm p-2 hover:bg-cream-dark"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="line-clamp-2 text-sm font-medium text-charcoal">
                        {product.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={goToSearchResults}
                className="mt-2 w-full border-t border-border px-2 pt-3 pb-2 text-left text-sm font-medium text-terra hover:text-charcoal"
              >
                View all results for “{query.trim()}”
              </button>
            </div>
          ) : !isLoading ? (
            <p className="px-4 py-5 text-sm text-charcoal-light">
              No matching results.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
