'use client';

import { FC, useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Link from '@/components/ui/atoms/link';
import QuantitySelector from '@/components/ui/atoms/quantity-selector';
import Breadcrumb from '@/components/ui/molecules/breadcrumb';
import Gallery from '@/components/ui/organisms/gallery';
import { useAddToCartOverlay } from '@/context/add-to-cart-overlay';
import useClassNames from '@/hooks/useClassNames';
import { ShippingMethod } from '@/types/entity/cart';
import AdditionalInfo from './components/additional-info';
import ProductInformation from './components/product-information';
import ShippingSection from './components/shipping-section';
import useTrack from './hooks/useTrack';
import { UIProduct } from './types';
import type { Category, Variant } from '@/lib/types';

export interface ProductDetailsProps {
  product: UIProduct;
  variant: Variant;
  url?: string;
  category?: Category;
  shippingMethods?: ShippingMethod[];
  inModalVersion?: boolean;
  onChangeVariant: (sku: string) => void;
  setIsOpen?: (value: boolean) => void;
  onAddToCart?: (variant: Variant, quantity: number) => Promise<void>;
  inCartQuantity?: number;
}

const ProductDetails: FC<ProductDetailsProps> = ({
  product,
  variant,
  category,
  url,
  shippingMethods,
  inModalVersion,
  onChangeVariant,
  setIsOpen,
  onAddToCart,
  inCartQuantity = 0,
}) => {
  const translate = useTranslations();

  const [quantity, setQuantity] = useState<number>(
    variant?.availability?.isOnStock ? 1 : 0,
  );
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const { trackAddToCart } = useTrack({ product, inModalVersion });

  const { show, fetchRelatedProducts } = useAddToCartOverlay();

  const handleAddToCart = async () => {
    setLoading(true);

    onAddToCart?.(variant, quantity).then(() => {
      setLoading(false);

      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setQuantity(inCartQuantity + quantity >= (variant?.availability?.availableQuantity ?? 0) ? 0 : 1);
      }, 1000);

      show({ ...product }, variant, quantity);
    });
    trackAddToCart();
  };

  useEffect(() => {
    fetchRelatedProducts(product);
  }, [product, fetchRelatedProducts]);

  const wrapperClassName = inModalVersion
    ? 'md:grid grid-cols-12 pt-17.5 pb-9 px-5 md:pr-9'
    : 'pt-5 md:pt-6 pb-8 md:grid md:grid-cols-12 md:items-start lg:px-12 md:px-6 px-4';

  const galleryContainerClassName = useClassNames([
    inModalVersion ? 'col-span-6' : 'md:col-span-7 lg:col-span-8',
    'md:pr-6.5 lg:pr-15',
  ]);

  const informationContainerClassName = useClassNames([
    inModalVersion ? 'col-span-6' : 'md:col-span-5 lg:col-span-4',
    'mt-6 md:mt-0',
  ]);

  return (
    <div className={wrapperClassName}>
      {category && !inModalVersion && (
        <Breadcrumb Separator="/" className="col-span-12 mb-6 hidden w-fit lg:block">
          <Link key={category.id} link={`/category/${category.slug}`} className="text-sm text-gray-700">
            <h2>{category.name}</h2>
          </Link>

          <h2 key={product.slug} className="cursor-default text-sm text-gray-500">
            {product.name}
          </h2>
        </Breadcrumb>
      )}

      <div className={galleryContainerClassName}>
        <Gallery images={variant.images ?? []} inModalVersion={inModalVersion} />
      </div>

      <div className={informationContainerClassName}>
        <ProductInformation
          product={product}
          variant={variant}
          category={category}
          onChangeVariant={onChangeVariant}
          inModalVersion={inModalVersion}
        />

        {!variant?.availability?.isOnStock && (
          <div className="pt-5">
            <p className="font-medium text-red-500">{translate('product.outOfStock')}</p>
          </div>
        )}

        <div className="flex gap-2 pt-5">
          <QuantitySelector
            value={quantity}
            minValue={inCartQuantity >= (variant?.availability?.availableQuantity ?? 0) ? 0 : Number(variant?.availability?.isOnStock)}
            maxValue={(variant?.availability?.availableQuantity ?? Infinity) - inCartQuantity}
            disabled={!variant?.availability?.isOnStock}
            onChange={setQuantity}
          />
          <Button
            className="w-full rounded-sm text-sm font-medium"
            variant="primary"
            onClick={handleAddToCart}
            loading={loading}
            added={added}
            disabled={!variant?.availability?.isOnStock}
          >
            {variant?.availability?.isOnStock ? translate('cart.cart-add') : translate('product.currently-unavailable')}
          </Button>
        </div>

        {!inModalVersion && <ShippingSection shippingMethods={shippingMethods} />}

        {inModalVersion && (
          <Link
            link={url}
            className="mx-auto mt-7 block w-fit border-b border-transparent text-center text-sm leading-loose text-gray-600 hover:border-gray-600"
            onClick={() => setIsOpen?.(false)}
          >
            {translate('cart.more-details')}
          </Link>
        )}
      </div>

      {!inModalVersion && (
        <div className="grid gap-y-8.5 md:col-span-7 md:mb-12.5 md:pr-5 lg:col-span-8 lg:pr-13">
          <AdditionalInfo description={product?.description ?? ''} />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
