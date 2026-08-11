import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';

export default function ShopByCategory({ categories, locale }: { categories: Category[]; locale: string }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-xl font-semibold">Shop by category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              locale={locale}
              className="group overflow-hidden rounded-sm border border-charcoal/10 bg-white transition-colors hover:border-charcoal/30"
            >
              <div className="relative aspect-square overflow-hidden bg-cream">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-charcoal-light">
                    No image
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <span className="text-lg font-semibold text-charcoal group-hover:text-terra">
                  {category.name}
                </span>
                <span className="shrink-0 text-sm text-charcoal-light group-hover:text-terra">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
