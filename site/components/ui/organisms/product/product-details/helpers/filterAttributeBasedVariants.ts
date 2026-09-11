import { Variant } from '@/lib/types';

export const filterAttributeBasedVariants = (
  variants: Variant[],
  currentVariant: Variant,
  attribute: string,
) => {
  const filteredVariants = variants?.filter(
    ({ attributes }) =>
      (attributes as unknown as Record<string, string>)?.[attribute] ===
      (currentVariant.attributes as unknown as Record<string, string>)?.[
        attribute
      ],
  );
  return filteredVariants;
};
