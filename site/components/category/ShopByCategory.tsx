'use client';

import type { Category } from '@/lib/types';
import Tile from '@/components/ui/molecules/tile';
import { Reference } from '@/types/reference';

export default function ShopByCategory({
  categories,
  // locale,
}: {
  categories: Category[];
  locale?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-xl font-semibold">Shop by category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category) => {
            const categoryImage = category.image
              ? {
                  src: category.image,
                  alt: category.name,
                  width: 1000,
                  height: 1000,
                }
              : undefined;
            const categoryLink: Reference = {
              type: 'link',
              link: `/category/${category.slug}`,
            };

            return (
              <Tile
                key={category.id}
                image={categoryImage}
                title={category.name}
                subtitle={''}
                ctaLabel="Shop now"
                ctaReference={categoryLink}
                roundedBorders={true}
                className="min-h-75 overflow-hidden rounded-sm"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
