import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug } from '@/lib/ct/product';
import AddToCartForm from '@/components/product/AddToCartForm';
import WishlistToggleButton from '@/components/product/WishlistToggleButton';
import ProductSpecifications from '@/components/product/ProductSpecifications';
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

  const images = product.variants[0]?.images ?? [];
  const defaultVariant = product.variants[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-charcoal-light">
        <Link href="/category/all" locale={locale} className="hover:text-terra">Shop</Link>
        <span aria-hidden>/</span>
        <span className="truncate text-charcoal">{product.name}</span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-16">
        <section aria-label="Product images" className="grid grid-cols-2 gap-3">
          {images.length > 0 ? (
            images.map((src, i) => (
              <div key={src} className={`relative overflow-hidden rounded-sm bg-white ${i === 0 ? 'col-span-2 aspect-square' : 'aspect-square'}`}>
                <Image
                  src={src}
                  alt={`${product.name}${images.length > 1 ? ` – view ${i + 1}` : ''}`}
                  fill
                  priority={i === 0}
                  sizes={i === 0 ? '(max-width: 1024px) 100vw, 58vw' : '(max-width: 1024px) 50vw, 29vw'}
                  className="object-contain p-4 md:p-8"
                />
              </div>
            ))
          ) : (
            <div className="col-span-2 flex aspect-square items-center justify-center rounded-sm bg-cream-dark text-charcoal-light">
              No image available
            </div>
          )}
        </section>

        <section className="lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-terra">Deco Store collection</p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-charcoal md:text-4xl">{product.name}</h1>
            </div>
            {defaultVariant && (
              <WishlistToggleButton productId={product.id} variantId={defaultVariant.id} locale={locale} />
            )}
          </div>

          {product.description && <p className="mt-5 text-base leading-7 text-charcoal-light">{product.description}</p>}

          <div className="mt-7 border-t border-border pt-7">
            <AddToCartForm product={product} locale={locale} attributeLabels={attributeLabels} />
          </div>

          {defaultVariant && (
            <div className="mt-8">
              <ProductSpecifications variant={defaultVariant} locale={locale} labels={attributeLabels} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
