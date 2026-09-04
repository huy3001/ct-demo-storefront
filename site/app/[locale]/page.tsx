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
import Banner from '@/components/ui/molecules/banner';

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
        <div className="mx-auto max-w-7xl">
          <Banner
            title="Considered goods, made to last."
            description="Explore our latest collection, thoughtfully sourced and delivered to
            your door."
            buttonText="Shop the collection"
            buttonLink={{ type: 'link', link: '/category/all' }}
            alignment="center"
            locale={locale}
          />
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

      <section className="mx-auto max-w-7xl py-10">
        <Banner
          title="The sale is on"
          heading="Limited-time offers"
          description="Discover considered pieces at exceptional prices while they last."
          buttonText="Shop sale"
          buttonLink={{ type: 'link', link: '/category/sale' }}
          alignment="justify"
          variant="secondary"
          locale={locale}
          className="bg-charcoal"
        />
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
