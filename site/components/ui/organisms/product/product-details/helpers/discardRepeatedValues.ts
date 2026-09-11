import { Variant } from '@/lib/types';

export const discardRepeatedValues = (variants: Variant[], attribute: string) => {
  const uniqueValues: { [key: string]: boolean } = {};

  const variantsToDisplay = variants?.filter((variant) => {
    const value = (variant.attributes as unknown as Record<string, string>)?.[attribute];

    if (!value || uniqueValues[value]) return false;
    else {
      uniqueValues[value] = true;
      return true;
    }
  });

  return variantsToDisplay;
};
