import type { ProductProjection, ProductVariant, Price as CtPrice } from '@commercetools/platform-sdk';
import type { Product, Variant, Price } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

function mapPrice(price?: CtPrice): Price | undefined {
  if (!price) return undefined;
  return {
    centAmount: price.value.centAmount,
    currencyCode: price.value.currencyCode,
    discounted: price.discounted
      ? { centAmount: price.discounted.value.centAmount, currencyCode: price.discounted.value.currencyCode }
      : undefined,
  };
}

function mapVariant(variant: ProductVariant): Variant {
  return {
    id: variant.id,
    sku: variant.sku ?? '',
    images: (variant.images ?? []).map((img) => img.url),
    price: mapPrice(variant.price),
    prices: (variant.prices ?? []).map((p) => mapPrice(p)!).filter(Boolean),
    attributes: (variant.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    availability: { isOnStock: variant.availability?.isOnStock },
  };
}

export function mapProductProjection(product: ProductProjection, locale: string): Product {
  const variants = [product.masterVariant, ...(product.variants ?? [])].map(mapVariant);
  return {
    type: 'Product',
    id: product.id,
    name: getLocalizedString(product.name, locale),
    slug: getLocalizedString(product.slug, locale),
    description: getLocalizedString(product.description, locale),
    categories: (product.categories ?? []).map((c) => ({ id: c.id })),
    variants,
  };
}
