import type { UIColor } from '@/components/ui/organisms/product/product-details/types';
import type { Product, Variant } from '@/lib/types';

const grayFix = (word: string) => (word === 'grey' ? 'gray' : word);

export const getVariantAttribute = (variant: Variant, name: string): unknown =>
  variant.attributes?.find((attribute) => attribute.name === name)?.value;

export const toOptionValue = (value: unknown): { key: string; label: string } | undefined => {
  if (typeof value === 'string') return { key: value, label: value };
  if (!value || typeof value !== 'object') return undefined;

  const { key, label } = value as { key?: unknown; label?: unknown };
  if (typeof key !== 'string') return undefined;

  return { key, label: typeof label === 'string' ? label : key };
};

export const toUIColor = (product: Product) => {
  const colors = new Map<string, UIColor>();

  product.variants?.forEach((variant) => {
    const color = toOptionValue(getVariantAttribute(variant, 'color'));

    if (color && !colors.has(color.label)) {
      colors.set(color.label, {
        name: color.label,
        key: color.key,
        bgColor: grayFix(color.key),
        selectedColor: grayFix(color.key),
      });
    }
  });

  return [...colors.values()];
};
