import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/ct/product';
import AddToCartForm from '@/components/product/AddToCartForm';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import RelatedProductsSlider from '@/components/product/RelatedProductsSlider';
import WishlistToggleButton from '@/components/product/WishlistToggleButton';
import ProductSpecifications from '@/components/product/ProductSpecifications';
import RecentlyViewedTracker from '@/components/product/RecentlyViewedTracker';
import { getProductAttributeLabels } from '@/lib/ct/product-attributes';
import { Link } from '@/i18n/routing';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [product, attributeLabels] = await Promise.all([
    getProductBySlug(slug, locale),
    getProductAttributeLabels(locale),
  ]);
  if (!product) notFound();

  const categoryId = product.categories[0]?.id;
  const relatedProducts = categoryId
    ? await getRelatedProducts(categoryId, product.id, locale, 8)
    : [];

  const images = product.variants[0]?.images ?? [];
  const defaultVariant = product.variants[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <RecentlyViewedTracker product={product} locale={locale} />
      <nav
        aria-label="Breadcrumb"
        className="mb-7 flex items-center gap-2 text-sm text-charcoal-light"
      >
        <Link
          href="/category/all"
          locale={locale}
          className="hover:text-terra"
        >
          Shop
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-charcoal">{product.name}</span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-16">
        <ProductImageGallery
          images={images}
          productName={product.name}
        />

        <section className="lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-terra">
                Deco Store collection
              </p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-charcoal md:text-4xl">
                {product.name}
              </h1>
            </div>
            {defaultVariant && (
              <WishlistToggleButton
                productId={product.id}
                variantId={defaultVariant.id}
                locale={locale}
              />
            )}
          </div>

          {product.description && (
            <p className="mt-5 line-clamp-4 text-base leading-7 text-charcoal-light">
              {product.description}
            </p>
          )}

          <div className="mt-7 border-t border-border pt-7">
            <AddToCartForm
              product={product}
              locale={locale}
              attributeLabels={attributeLabels}
            />

            <div
              className="mt-6 rounded-sm bg-cream-dark p-4"
              aria-label="Shipping methods"
            >
              <div className="flex items-start gap-3">
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
                  className="lucide lucide-truck-icon lucide-truck size-5 shrink-0 text-terra"
                >
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle
                    cx="17"
                    cy="18"
                    r="2"
                  />
                  <circle
                    cx="7"
                    cy="18"
                    r="2"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-medium text-charcoal">
                    Shipping methods
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-charcoal">Standard delivery</dt>
                      <dd className="text-right text-charcoal-light">
                        3–5 business days
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-charcoal">Express delivery</dt>
                      <dd className="text-right text-charcoal-light">
                        1–2 business days
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-5 text-charcoal-light">
                    Available methods and shipping costs are calculated at
                    checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {product.description && (
            <details className="group mt-8 border-t border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-medium text-charcoal marker:hidden">
                <span>Product description</span>
                <span
                  aria-hidden
                  className="text-xl font-light transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="whitespace-pre-line pb-5 text-sm leading-6 text-charcoal-light">
                {product.description}
              </div>
            </details>
          )}

          {defaultVariant && (
            <div className={product.description ? '' : 'mt-8'}>
              <ProductSpecifications
                variant={defaultVariant}
                locale={locale}
                labels={attributeLabels}
              />
            </div>
          )}
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProductsSlider
          products={relatedProducts}
          locale={locale}
        />
      )}
    </div>
  );
}
