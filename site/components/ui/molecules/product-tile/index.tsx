'use client';

import { FC, useMemo, useState } from 'react';
import { useTranslations } from 'use-intl';
import Image from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import OutOfStock from '@/components/ui/atoms/out-of-stock';
import QuickView from '@/components/ui/organisms/product/product-quick-view';
import WishlistButton from '@/components/ui/organisms/wishlist/components/wishlist-button';
import useMediaQuery from '@/hooks/useMediaQuery';
import useVariantWithDiscount from '@/hooks/useVariantWithDiscount';
import { textToColor } from '@/helpers/textToColor/textToColor';
import { desktop } from '@/helpers/utils/screensizes';
import { Cart, ShippingMethod } from '@/types/entity/cart';
import Prices from './prices';
import useTrack from './useTrack';
import { ProductReviewBlock } from '@/components/product/ProductReviews';
import type { Product, Variant } from '@/lib/types';
import type { Attribute } from '@commercetools/platform-sdk';

export interface ProductTileProps {
  product: Product;
  isSearchResult?: boolean;
  disableQuickView?: boolean;
  disableWishlistButton?: boolean;
  disableVariants?: boolean;
  showWishlistSelector?: boolean;
  selectedVariantIndex?: number;
  cart?: Cart;
  shippingMethods?: ShippingMethod[];
  onClick?: () => void;
  onAddToCart?: (variant: Variant, quantity: number) => Promise<void>;
}

const ProductTile: FC<ProductTileProps> = ({
  product,
  isSearchResult = false,
  disableQuickView = false,
  disableWishlistButton = false,
  disableVariants = false,
  showWishlistSelector = true,
  selectedVariantIndex = 0,
  cart,
  shippingMethods,
  onClick,
  onAddToCart,
}) => {
  const [isDesktopSize] = useMediaQuery(desktop);

  const { ref } = useTrack({ product });
  const translate = useTranslations();

  const variantWithDiscount = useVariantWithDiscount(
    product.variants,
  ) as Variant;

  const [userSelectedVariant, setUserSelectedVariant] = useState<
    Variant | undefined
  >(undefined);

  const selectedVariant =
    userSelectedVariant ??
    variantWithDiscount ??
    product?.variants[selectedVariantIndex];

  const hasDiscount =
    selectedVariant?.price?.centAmount &&
    selectedVariant?.price?.discounted?.centAmount &&
    selectedVariant?.price?.discounted?.centAmount <
      selectedVariant?.price?.centAmount;

  const discountedPrice = selectedVariant?.price?.discounted;

  const discountPercentage = selectedVariant
    ? ((selectedVariant.price?.centAmount as number) -
        (discountedPrice?.centAmount as number)) /
      (selectedVariant.price?.centAmount as number)
    : 0;

  const productUrl = useMemo(() => {
    if (!product.slug)
      return `/product/${(product.name ?? '').toLowerCase().replace(/\s+/g, '-')}`;

    const name = product.slug;

    return `/product/${name}` + (isSearchResult ? '?sr=1' : '');
  }, [product, isSearchResult]);

  const getVariantColorCode = (attributes: Attribute[] | undefined) => {
    if (!attributes) return undefined;

    const attributeValues = Array.isArray(attributes)
      ? Object.fromEntries(attributes.map(({ name, value }) => [name, value]))
      : attributes;

    const directCode =
      attributeValues['color-code'] || attributeValues['finish-code'];
    if (typeof directCode === 'string' && directCode) return directCode;

    const getLabel = (value: unknown) => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null && 'label' in value) {
        const label = value.label;
        return typeof label === 'string' ? label : undefined;
      }
      return undefined;
    };

    const labelOrText =
      getLabel(attributeValues['color-label']) ||
      getLabel(attributeValues['finish-label']) ||
      getLabel(attributeValues.color) ||
      getLabel(attributeValues.finish) ||
      getLabel(attributeValues['search-color']) ||
      getLabel(attributeValues['search-finish']);

    return labelOrText ? textToColor(labelOrText).code : undefined;
  };

  return (
    <div
      ref={ref}
      data-testid="product-tile"
    >
      <div className="group relative">
        <Link link={productUrl}>
          <div
            className="relative w-full"
            data-testid="image-container"
            onClick={onClick}
          >
            <div className="relative flex justify-center bg-white p-2 md:p-4">
              <div
                className="relative block w-[94%]"
                style={{ paddingBottom: '122%' }}
              >
                <Image
                  src={selectedVariant.images?.[0]}
                  suffix="medium"
                  alt={product.name ?? ''}
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  className="rounded-sm group-hover:opacity-75 md:p-4"
                  fill
                />
              </div>
            </div>
          </div>
        </Link>

        <span
          className="absolute right-0 top-0 z-10 flex size-8 cursor-pointer items-center justify-center md:size-12"
          onClick={(e) => e.preventDefault()}
        >
          {!disableWishlistButton && (
            <WishlistButton
              productId={product.id}
              variantId={selectedVariant.id}
              className="size-7 lg:size-8"
              showWishlistSelector={showWishlistSelector}
            />
          )}
        </span>

        <div className="absolute bottom-0 z-10 w-full">
          {hasDiscount && (
            <div className="w-full text-center">
              <span className="mb-2 ml-2 flex h-6 w-11 items-center justify-center bg-red-500 text-xs text-white">
                {translate('common.percentage', { value: discountPercentage })}
              </span>
            </div>
          )}
          {selectedVariant?.availability &&
            !selectedVariant?.availability?.isOnStock && (
              <div className="w-full text-center">
                <div className="mb-2 ml-2">
                  <OutOfStock />
                </div>
              </div>
            )}

          <QuickView
            buttonIsEnabled={isDesktopSize && !disableQuickView}
            product={product}
            cart={cart}
            shippingMethods={shippingMethods}
            onAddToCart={async (variant, quantity: number) => {
              await onAddToCart?.(variant, quantity);
            }}
          />
        </div>
      </div>

      <Link link={productUrl}>
        <div onClick={onClick}>
          <div className="mt-1 block max-w-[80%] overflow-hidden text-ellipsis whitespace-pre text-xs uppercase leading-loose md:mt-3 md:text-sm">
            {product?.name}
          </div>
          <ProductReviewBlock reviews={product.reviews ?? []} />
          {!disableVariants && (
            <div className="mt-2 flex items-center gap-1 md:mt-3">
              {product?.variants
                .filter(
                  (variant, index, arr) =>
                    arr.findIndex(
                      (v) =>
                        (getVariantColorCode(v.attributes) ?? '') ===
                        (getVariantColorCode(variant.attributes) ?? ''),
                    ) === index,
                )
                .map((variant, index) => {
                  return variant.attributes.length > 0 ? (
                    <span
                      key={index}
                      data-testid="product-variant"
                      className={`block cursor-pointer rounded-full border p-1.5 ${
                        variant.sku !== selectedVariant.sku
                          ? 'border-neutral-300'
                          : 'border-neutral-500'
                      }`}
                      style={{
                        backgroundColor: getVariantColorCode(
                          variant.attributes,
                        ),
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setUserSelectedVariant(variant);
                      }}
                    ></span>
                  ) : null;
                })}
            </div>
          )}
          {selectedVariant?.price && (
            <div className="mt-2 md:mt-3">
              <Prices
                price={selectedVariant?.price}
                discountedPrice={discountedPrice}
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductTile;
