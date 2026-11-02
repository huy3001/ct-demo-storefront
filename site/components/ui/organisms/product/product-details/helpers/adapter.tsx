import { FC, useState } from 'react';
import usePath from '@/hooks/usePath';
import usePreloadImages from '@/hooks/usePreloadImages';
import { toUIColor } from '@/helpers/mappers/toUIColor';
import { toUIProduct } from '@/helpers/mappers/toUIProduct';
import { toUISize } from '@/helpers/mappers/toUIsize';
import { Cart, ShippingMethod } from '@/types/entity/cart';
import ProductDetails, { ProductDetailsProps } from '..';
import type { Category, Product, Variant } from '@/lib/types';

type ProductDetailsAdapterProps = {
  product: Product;
  inModalVersion?: ProductDetailsProps['inModalVersion'];
  categories: Category[];
  cart?: Cart;
  shippingMethods?: ShippingMethod[];
  setIsOpen?: (value: boolean) => void;
  onAddToCart?: (variant: Variant, quantity: number) => Promise<void>;
};

const ProductDetailsAdapter: FC<ProductDetailsAdapterProps> = ({
  product,
  inModalVersion,
  categories,
  cart,
  shippingMethods,
  setIsOpen,
  onAddToCart,
}) => {
  const { path } = usePath();

  const category = categories.find((category) => product.categories?.find((c) => c.id === category.id));

  const [variant, setVariant] = useState(() => {
    if (inModalVersion) {
      return product?.variants[0];
    } else {
      const currentVariantPath = path.split('/');
      const currentVariantSKU = currentVariantPath[3]?.split('?')[0];
      const currentVariantIndex = product?.variants.findIndex(({ sku }) => sku == currentVariantSKU);

      return product.variants[currentVariantIndex] ?? product.variants?.[0];
    }
  });

  const inCartQuantity = cart?.lineItems?.find((lineItem) => lineItem.variant?.sku === variant.sku)?.count ?? 0;

  usePreloadImages(product.variants.map((variant) => variant.images ?? []).flat(), 'large');

  const mappedProduct = toUIProduct(product, variant, toUIColor(product), toUISize(product));

  const handleChangeVariant = (sku: string) => {
    const variantsToUse = product.variants.find((variant) => variant.sku === sku);

    if (variantsToUse) setVariant(variantsToUse);
  };

  return (
    <ProductDetails
      product={{ ...mappedProduct, images: [mappedProduct.images[0]] }}
      variant={variant}
      category={category}
      url={`/product/${product.slug}`}
      inModalVersion={inModalVersion}
      shippingMethods={shippingMethods}
      onChangeVariant={handleChangeVariant}
      setIsOpen={setIsOpen}
      onAddToCart={onAddToCart}
      inCartQuantity={inCartQuantity}
    />
  );
};

export default ProductDetailsAdapter;
