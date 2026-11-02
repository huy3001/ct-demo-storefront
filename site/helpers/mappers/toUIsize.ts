import type { UISize } from '@/components/ui/organisms/product/product-details/types';
import type { Product } from '@/lib/types';
import { getVariantAttribute, toOptionValue } from './toUIColor';

export const toUISize = (product: Product) => {
  const sizes = new Map<string, UISize>();

  product.variants?.forEach((variant) => {
    const size = toOptionValue(getVariantAttribute(variant, 'commonSize'));

    if (size && !sizes.has(size.label)) sizes.set(size.label, size);
  });

  return [...sizes.values()];
};
