import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/ct/product';
import AddToCartForm from '@/components/product/AddToCartForm';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import RelatedProductsSlider from '@/components/product/RelatedProductsSlider';
// import WishlistToggleButton from '@/components/product/WishlistToggleButton';
import ProductSpecifications from '@/components/product/ProductSpecifications';
import RecentlyViewedTracker from '@/components/product/RecentlyViewedTracker';
import { getProductAttributeLabels } from '@/lib/ct/product-attributes';
import { Link } from '@/i18n/routing';
import { ProductVariantProvider } from '@/components/product/ProductVariantProvider';
import {
  ProductReviewsAccordion,
  ProductReviewSummary,
  ReviewsProvider,
} from '@/components/product/ProductReviews';
import Breadcrumb from '@/components/ui/molecules/breadcrumb';
import WishlistButton from '@/components/ui/organisms/wishlist/components/wishlist-button';
import CompareButton from '@/components/product/CompareButton';
import Accordion from '@/components/ui/atoms/accordion';
import ShippingSection from '@/components/ui/organisms/product/product-details/components/shipping-section';
import { ShippingMethod } from '@/types/cart/ShippingMethod';

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

  const defaultVariant = product.variants[0];

  const shippingMethods: ShippingMethod[] = [
    {
      shippingMethodId: 'standard',
      name: 'Standard Shipping',
      description: 'Delivered within 5-7 business days',
    },
    {
      shippingMethodId: 'express',
      name: 'Express Shipping',
      description: 'Delivered within 2-3 business days',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <RecentlyViewedTracker
        product={product}
        locale={locale}
      />
      <Breadcrumb
        Separator="/"
        className="mb-7 hidden w-fit md:block"
        listClassName="px-0!"
      >
        <Link
          href="/"
          locale={locale}
          className="text-sm text-charcoal-light hover:text-terra"
        >
          Home
        </Link>

        <Link
          href={`/category/all`}
          locale={locale}
          className="text-sm text-charcoal-light hover:text-terra"
        >
          Shop
        </Link>

        <span className="cursor-default text-sm truncate text-charcoal">
          {product.name}
        </span>
      </Breadcrumb>

      <ProductVariantProvider
        product={product}
        locale={locale}
      >
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-16">
          <ProductImageGallery
            productName={product.name}
            brand={product.brand}
            brandLogo={product.brandLogo}
          />

          <ReviewsProvider
            productId={product.id}
            initialReviews={product.reviews}
          >
            <section>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-terra">
                    {product.brand || 'Deco Store collection'}
                  </p>
                  <h1 className="text-3xl font-semibold leading-tight tracking-tight text-charcoal md:text-4xl">
                    {product.name}
                  </h1>
                  <ProductReviewSummary />
                </div>
                <div className="flex items-center gap-2">
                  {defaultVariant && (
                    <WishlistButton
                      productId={product.id}
                      variantId={defaultVariant.id}
                      className="size-6 lg:size-8"
                    />
                  )}
                  <CompareButton
                    product={product}
                    locale={locale}
                  />
                </div>
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

                <ShippingSection shippingMethods={shippingMethods} />
              </div>

              {product.description && (
                <Accordion
                  variant="arrow"
                  closedSectionTitle="Product description"
                  openSectionTitle="Product description"
                  className="mt-8 border-t border-border"
                  buttonClassName="font-medium text-charcoal py-5"
                  panelClassName="whitespace-pre-line pb-5 text-sm text-charcoal-light"
                >
                  {product.description}
                </Accordion>
              )}

              {defaultVariant && (
                <div className={product.description ? '' : 'mt-8'}>
                  <ProductSpecifications
                    locale={locale}
                    labels={attributeLabels}
                  />
                </div>
              )}

              <ProductReviewsAccordion />
            </section>
          </ReviewsProvider>
        </div>
      </ProductVariantProvider>

      {relatedProducts.length > 0 && (
        <RelatedProductsSlider
          products={relatedProducts}
          locale={locale}
        />
      )}
    </div>
  );
}
