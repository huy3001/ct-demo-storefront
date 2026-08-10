import { getFeaturedProducts } from '@/lib/ct/product';
import { getCategoryTree } from '@/lib/ct/category';
import ProductGrid from '@/components/product/ProductGrid';
import { Link } from '@/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [featured, categoryTree] = await Promise.all([
    getFeaturedProducts(locale, 8),
    getCategoryTree(locale),
  ]);
  const categories = categoryTree.filter((category) => category.slug);

  return (
    <div>
      <section className="bg-cream-dark">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-charcoal">
            Considered goods, made to last.
          </h1>
          <p className="mt-4 text-charcoal-light max-w-xl mx-auto">
            Explore our latest collection, thoughtfully sourced and delivered to
            your door.
          </p>
          <Link
            href="/category/all"
            locale={locale}
            className="inline-block mt-8 bg-charcoal text-white px-6 py-3 rounded-sm text-sm hover:bg-charcoal-light"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-xl font-semibold mb-8">Featured products</h2>
        <ProductGrid
          products={featured}
          locale={locale}
        />
      </section>

      {categories.length > 0 && (
        <section className="bg-cream-dark">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-xl font-semibold mb-8">Shop by category</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  locale={locale}
                  className="group flex flex-col gap-4 min-h-36 items-center justify-center rounded-sm border border-charcoal/10 bg-white p-6 transition-colors hover:border-charcoal/30"
                >
                  <span className="text-xl font-semibold text-charcoal group-hover:text-terra">
                    {category.name}
                  </span>
                  <span className="inline-block bg-charcoal text-white px-6 py-3 rounded-sm text-sm hover:bg-charcoal-light">
                    Shop now
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
