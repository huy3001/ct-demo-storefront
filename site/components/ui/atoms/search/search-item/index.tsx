import React from 'react';
import Image from '@/components/ui/atoms/image';
import Link from '../../link';
import type { SearchSuggestions } from '@/lib/ct/search-suggestions';

interface Props {
  suggestions: SearchSuggestions;
  setIsOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
}

const SearchItem: React.FC<Props> = ({ suggestions, setIsOpen, setQuery }) => {
  return (
    <>
      <div className="space-y-5">
        {suggestions.categories.length > 0 && (
          <div>
            <p className="px-2 py-2 text-sm font-semibold uppercase tracking-wider text-charcoal-light">
              Categories
            </p>
            {suggestions.categories.map((category) => (
              <Link
                key={category.id}
                link={`/category/${category.slug}?${new URLSearchParams({ f_category: category.name })}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-charcoal hover:bg-cream-dark hover:text-terra"
              >
                <span aria-hidden="true">↗</span>
                {category.name}
              </Link>
            ))}
          </div>
        )}
        {suggestions.brands.length > 0 && (
          <div
            className={
              suggestions.categories.length ? 'border-t border-border pt-5' : ''
            }
          >
            <p className="px-2 py-2 text-sm font-semibold uppercase tracking-wider text-charcoal-light">
              Brands
            </p>
            {suggestions.brands.map((brand) => (
              <Link
                key={brand}
                link={`/search?${new URLSearchParams({ q: brand, f_productBrand: brand })}`}
                onClick={() => {
                  setQuery(brand);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-charcoal hover:bg-cream-dark hover:text-terra"
              >
                <span aria-hidden="true">↗</span>
                {brand}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {suggestions.products.length > 0 && (
        <div
          className={
            suggestions.categories.length || suggestions.brands.length
              ? 'border-t border-border pt-5 md:border-t-0 md:pt-0'
              : ''
          }
        >
          <p className="px-2 py-2 text-sm font-semibold uppercase tracking-wider text-charcoal-light">
            Products
          </p>
          {suggestions.products.map((product) => (
            <Link
              key={product.id}
              link={`/product/${product.slug}`}
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
              <span className="min-w-0">
                {product.brand && (
                  <span className="block truncate text-xs uppercase tracking-wide text-terra">
                    {product.brand}
                  </span>
                )}
                <span className="line-clamp-2 text-sm font-medium text-charcoal">
                  {product.name}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default SearchItem;
