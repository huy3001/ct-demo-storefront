import { useMemo } from 'react';
import { useProductList } from '@/components/ui/organisms/product/product-list/context';
import type { Variant } from '@/lib/types';

const useSelectedColorFilterVariantIndex = (variants: Partial<Variant>[]) => {
  const { activeRefinements } = useProductList();
  return useMemo(() => {
    const index = variants.findIndex((curr) => {
      return activeRefinements.some(
        (refinement) => refinement.label === curr?.attributes?.[0]?.name,
      );
    });
    return index !== -1 ? index : undefined;
  }, [activeRefinements, variants]);
};

export default useSelectedColorFilterVariantIndex;
