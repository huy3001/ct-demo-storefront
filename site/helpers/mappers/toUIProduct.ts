import type { UIColor, UIProduct, UISize } from '@/components/ui/organisms/product/product-details/types';
import type { Product, Variant } from '@/lib/types';
import { getVariantAttribute, toOptionValue } from './toUIColor';

export const toUIProduct = (product: Product, variant: Variant, colors: UIColor[], sizes: UISize[]) => {
  const designer = toOptionValue(getVariantAttribute(variant, 'designer'));
  const gender = toOptionValue(getVariantAttribute(variant, 'gender'));
  const madeInItaly = getVariantAttribute(variant, 'madeInItaly');

  const mappedProduct: UIProduct = {
    ...product,
    name: product.name ?? '',
    variants: product.variants,
    price: variant?.price ?? {},
    images:
      variant?.images?.map((src, id) => ({
        id: `${variant.sku}-${id}`,
        src,
        alt: variant.sku,
      })) ?? [],
    colors,
    sizes,
    description: product.description || '',
    details: [
      {
        name: 'Features',
        items: [
          designer && `Designer: ${designer.label}`,
          gender && `Collection: ${gender.label}`,
          madeInItaly && 'Made in Italy',
        ].filter((item): item is string => typeof item === 'string'),
      },
    ],
  };

  return mappedProduct;
};
