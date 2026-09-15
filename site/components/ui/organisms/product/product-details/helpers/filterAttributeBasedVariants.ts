import { Variant } from '@/lib/types';

export const filterAttributeBasedVariants = (
  variants: Variant[],
  currentVariant: Variant,
  attribute: string,
) => {
  const currentAttribute = currentVariant.attributes.find(
    ({ name }) => name === attribute,
  );
  const filteredVariants = variants?.filter(({ attributes }) =>
    attributes.some(({ name }) => name === currentAttribute?.name),
  );
  return filteredVariants;
};
