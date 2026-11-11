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
      <section className="bg-cream-dark relative">
        <Banner
          image={{
            src: '/main-banner.jpg',
          }}
          title="Heavy equipment for a stronger tomorrow"
          description="Reliable machinery for every challenge"
          buttonText="Shop the collection"
          buttonLink={{ type: 'link', link: '/category/all' }}
          alignment="center"
          variant="secondary"
          locale={locale}
          className="static! lg:py-16 xl:py-32"
        />
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
          image={{
            src: '/sale-banner.jpg',
          }}
          title=""
          // heading="Limited-time offers"
          // description="Discover considered pieces at exceptional prices while they last."
          // buttonText="Shop sale"
          // buttonLink={{ type: 'link', link: '/category/sale' }}
          alignment="justify"
          variant="secondary"
          locale={locale}
          className="bg-charcoal lg:py-28 xl:py-38"
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
