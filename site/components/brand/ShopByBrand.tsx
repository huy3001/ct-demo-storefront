import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { ProductBrand } from '@/lib/types';

export default function ShopByBrand({
  brands,
  locale,
}: {
  brands: ProductBrand[];
  locale: string;
}) {
  if (brands.length === 0) return null;

  return (
    <section
      className="bg-cream-dark"
      aria-labelledby="shop-by-brand-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2
            id="shop-by-brand-heading"
            className="text-xl font-semibold"
          >
            Shop by brand
          </h2>
          <Link
            href="/brands"
            locale={locale}
            className="flex items-center gap-2 text-sm font-medium text-charcoal underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.slice(0, 4).map((brand) => {
            const searchQuery = new URLSearchParams({
              q: brand.name,
              f_productBrand: brand.name,
            });

            return (
              <Link
                key={brand.name}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
