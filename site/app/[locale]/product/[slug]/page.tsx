import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug } from '@/lib/ct/product';
import AddToCartForm from '@/components/product/AddToCartForm';
import WishlistToggleButton from '@/components/product/WishlistToggleButton';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);
  if (!product) notFound();

  const images = product.variants[0]?.images ?? [];
  const defaultVariant = product.variants[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-12">
      <div className="grid grid-cols-2 gap-3">
        {images.length > 0 ? (
          images.map((src, i) => (
            <div key={src} className={`relative aspect-square bg-cream-dark rounded-sm overflow-hidden ${i === 0 ? 'col-span-2' : ''}`}>
              <Image src={src} alt={product.name} fill sizes="50vw" className="object-cover" />
            </div>
          ))
        ) : (
          <div className="col-span-2 aspect-square bg-cream-dark rounded-sm flex items-center justify-center text-charcoal-light">
            No image
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-charcoal">{product.name}</h1>
        {product.description && <p className="mt-4 text-charcoal-light">{product.description}</p>}
        {defaultVariant && (
          <WishlistToggleButton
            productId={product.id}
            variantId={defaultVariant.id}
            locale={locale}
            className="mt-6"
          />
        )}
        <div className="mt-8">
          <AddToCartForm product={product} locale={locale} />
        </div>
      </div>
    </div>
  );
}
