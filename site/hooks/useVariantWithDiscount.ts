import { useMemo } from 'react';
// import { Variant } from '@/types/entity/product';
import type { Variant } from '@/lib/types';

const useVariantWithDiscount = (variants: Partial<Variant>[]) => {
  const variant = useMemo(() => {
    return variants.reduce(
      (acc: Partial<Variant> | undefined, curr) =>
        curr?.price?.discounted &&
        (!acc ||
          (acc.price?.discounted?.centAmount as number) >
            (curr.price?.discounted?.centAmount as number))
          ? curr
          : acc,
      undefined,
    );
  }, [variants]);

  return variant;
};

export default useVariantWithDiscount;
