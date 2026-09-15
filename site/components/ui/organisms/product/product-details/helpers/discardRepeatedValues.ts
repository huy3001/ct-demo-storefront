import { Variant } from '@/lib/types';

export const discardRepeatedValues = (variants: Variant[], attribute: string) => {
  const uniqueValues: { [key: string]: boolean } = {};

  const variantsToDisplay = variants?.filter((variant) => {
    const value = variant.attributes.find(
      ({ name }) => name === attribute,
    )?.value;

    if (!value || uniqueValues[value]) return false;
    else {
      uniqueValues[value] = true;
      return true;
    }
  });

  return variantsToDisplay;
};
