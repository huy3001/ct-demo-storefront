import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Product } from '@/lib/types';
import { formatMoney } from '@/lib/utils';
import WishlistToggleButton from './WishlistToggleButton';

export default function ProductCard({
  product,
  locale,
  showWishlistSelector = true,
}: {
  product: Product;
  locale: string;
  showWishlistSelector?: boolean;
}) {
  const variant = product.variants[0];
  const image = variant?.images[0];
  const price = variant?.price;

  return (
    <div className="group">
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          locale={locale}
          className="block"
        >
          <div className="aspect-square bg-cream-dark rounded-sm overflow-hidden relative">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-light text-sm">
                No image
              </div>
            )}
          </div>
        </Link>
        {variant && (
          <WishlistToggleButton
            productId={product.id}
            variantId={variant.id}
            locale={locale}
            showWishlistSelector={showWishlistSelector}
            className="absolute right-2 top-2 z-10"
          />
        )}
      </div>
      <Link
        href={`/product/${product.slug}`}
        locale={locale}
        className="block mt-3"
      >
        <h3 className="text-sm font-medium text-charcoal group-hover:text-terra">
          {product.name}
        </h3>
        {price && (
          <p className="text-sm text-charcoal-light mt-1">
            {price.discounted ? (
              <>
                <span className="line-through mr-2">
                  {formatMoney(price.centAmount, price.currencyCode, locale)}
                </span>
                <span className="text-terra">
                  {formatMoney(
                    price.discounted.centAmount,
                    price.discounted.currencyCode,
                    locale,
                  )}
                </span>
              </>
            ) : (
              formatMoney(price.centAmount, price.currencyCode, locale)
            )}
          </p>
        )}
      </Link>
    </div>
  );
}
