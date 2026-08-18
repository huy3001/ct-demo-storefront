'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { attributeValueKey } from '@/lib/product-attributes';
import { isColorCodeFacet } from '@/lib/search-filters';
import type { Product, Variant } from '@/lib/types';

interface ProductVariantContextValue {
  attributeOptions: Map<string, Set<string>>;
  matchingVariant?: Variant;
  selected: Record<string, string>;
  selectAttribute: (name: string, value: string) => void;
}

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);

export function ProductVariantProvider({
  children,
  locale,
  product,
}: {
  children: ReactNode;
  locale: string;
  product: Product;
}) {
  const attributeOptions = useMemo(() => {
    const options = new Map<string, Set<string>>();

    for (const variant of product.variants) {
      for (const attribute of variant.attributes) {
        const value = attributeValueKey(attribute.value, locale);
        if (!options.has(attribute.name)) options.set(attribute.name, new Set());
        options.get(attribute.name)!.add(value);
      }
    }

    return new Map(
      [...options].filter(
        ([name, values]) => values.size > 1 && !isColorCodeFacet(name),
      ),
    );
  }, [locale, product.variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      [...attributeOptions.keys()].map((name) => {
        const attribute = product.variants[0]?.attributes.find(
          (item) => item.name === name,
        );
        return [name, attributeValueKey(attribute?.value, locale)];
      }),
    ),
  );

  const matchingVariant = useMemo(
    () =>
      product.variants.find((variant) =>
        Object.entries(selected).every(([name, selectedValue]) => {
          const attribute = variant.attributes.find((item) => item.name === name);
          return attributeValueKey(attribute?.value, locale) === selectedValue;
        }),
      ) ?? product.variants[0],
    [locale, product.variants, selected],
  );

  const value = useMemo(
    () => ({
      attributeOptions,
      matchingVariant,
      selected,
      selectAttribute: (name: string, selectedValue: string) =>
        setSelected((current) => ({ ...current, [name]: selectedValue })),
    }),
    [attributeOptions, matchingVariant, selected],
  );

  return (
    <ProductVariantContext.Provider value={value}>
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useProductVariant() {
  const context = useContext(ProductVariantContext);
  if (!context) {
    throw new Error('useProductVariant must be used within ProductVariantProvider');
  }
  return context;
}
