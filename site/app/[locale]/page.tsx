import {
  getFeaturedProducts,
  getProductBrands,
  getProductsByCategorySlug,
} from '@/lib/ct/product';
import { getCategoryTree } from '@/lib/ct/category';
import ProductGrid from '@/components/product/ProductGrid';
import RelatedProductsSlider from '@/components/product/RelatedProductsSlider';
import ShopByCategory from '@/components/category/ShopByCategory';
import ShopByBrand from '@/components/brand/ShopByBrand';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/atoms/button';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [newArrivals, featured, categoryTree, brands] = await Promise.all([
    getProductsByCategorySlug('new-arrivals', locale, 8),
    getFeaturedProducts(locale, 8),
    getCategoryTree(locale),
    getProductBrands(locale),
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
          <Button className="inline-block mt-8">
            <Link
              href="/category/all"
              locale={locale}
            >
              Shop the collection
            </Link>
          </Button>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <div className="mx-auto max-w-7xl px-4">
          <RelatedProductsSlider
            products={newArrivals}
            locale={locale}
            title="New arrivals"
            headingId="new-arrivals-heading"
            viewAllHref="/category/new-arrivals"
            showBorder={false}
          />
        </div>
      )}

      <ShopByBrand
        brands={brands}
        locale={locale}
      />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-8 rounded-sm bg-charcoal px-8 py-12 text-white sm:flex-row sm:items-center md:px-12">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/70">
              Limited-time offers
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              The sale is on
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              Discover considered pieces at exceptional prices while they last.
            </p>
          </div>
          <Button
            variant="secondary"
            className="shrink-0"
          >
            <Link
              href="/category/sale"
              locale={locale}
            >
              Shop sale
            </Link>
          </Button>
        </div>
      </section>

      <ShopByCategory
        categories={categories}
        locale={locale}
      />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-xl font-semibold mb-8">Featured products</h2>
        <ProductGrid
          products={featured}
          locale={locale}
        />
      </section>
    </div>
  );
}
