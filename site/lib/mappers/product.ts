import type {
  ProductProjection,
  ProductVariant,
  Price as CtPrice,
  ScopedPrice,
  StandalonePrice,
} from '@commercetools/platform-sdk';
import type { Product, Review, ReviewMedia, Variant, Price } from '@/lib/types';
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

function mapScopedPrice(price?: ScopedPrice): Price | undefined {
  if (!price) return undefined;

  const discounted = price.discounted?.value ?? (
    price.currentValue.centAmount !== price.value.centAmount
      ? price.currentValue
      : undefined
  );

  return {
    centAmount: price.value.centAmount,
    currencyCode: price.value.currencyCode,
    discounted: discounted
      ? {
          centAmount: discounted.centAmount,
          currencyCode: discounted.currencyCode,
        }
      : undefined,
  };
}

function mapStandalonePrice(price?: StandalonePrice): Price | undefined {
  if (!price) return undefined;
  return {
    centAmount: price.value.centAmount,
    currencyCode: price.value.currencyCode,
    discounted: price.discounted
      ? {
          centAmount: price.discounted.value.centAmount,
          currencyCode: price.discounted.value.currencyCode,
        }
      : undefined,
  };
}

function mapVariant(
  variant: ProductVariant,
  standalonePricesBySku?: ReadonlyMap<string, StandalonePrice>,
): Variant {
  return {
    id: variant.id,
    sku: variant.sku ?? '',
    images: (variant.images ?? []).map((img) => img.url),
    price:
      mapScopedPrice(variant.scopedPrice) ??
      mapPrice(variant.price) ??
      mapStandalonePrice(standalonePricesBySku?.get(variant.sku ?? '')),
    prices: (variant.prices ?? []).map((p) => mapPrice(p)!).filter(Boolean),
    attributes: (variant.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    availability: { isOnStock: variant.availability?.isOnStock },
  };
}

function getAttributeValue(variant: ProductVariant, name: string): unknown {
  return variant.attributes?.find((attribute) => attribute.name === name)?.value;
}

function getTextAttribute(variant: ProductVariant, name: string, locale: string): string | undefined {
  const value = getAttributeValue(variant, name);
  if (typeof value === 'string') return value.trim() || undefined;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return getLocalizedString(value as Record<string, string>, locale) || undefined;
  }
  return undefined;
}

function getAssetUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = getAssetUrl(item);
      if (url) return url;
    }
    return undefined;
  }
  if (!value || typeof value !== 'object') return undefined;

  const record = value as Record<string, unknown>;
  if (typeof record.url === 'string') return record.url;
  if (record.sources) return getAssetUrl(record.sources);
  return undefined;
}

export function mapReviews(value: unknown): Review[] {
  let items = value;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(items)) return [];

  return items.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const review = item as Record<string, unknown>;
    const rating = Number(review.rating);
    const author = typeof review.author === 'string' ? review.author : '';
    const title = typeof review.title === 'string' ? review.title : '';
    const content = typeof review.content === 'string' ? review.content : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !author || !title || !content) return [];
    const status = review.status;
    if (status !== undefined && status !== 'pending' && status !== 'approved' && status !== 'rejected') {
      return [];
    }

    const media = Array.isArray(review.media)
      ? review.media.flatMap((item): ReviewMedia[] => {
        if (!item || typeof item !== 'object') return [];
        const value = item as Record<string, unknown>;
        const type = value.type;
        const url = value.url;
        if ((type !== 'image' && type !== 'video') || typeof url !== 'string' || !url) {
          return [];
        }
        return [{
          type,
          url,
          name: typeof value.name === 'string' ? value.name : undefined,
        }];
      })
      : undefined;

    return [{
      id: typeof review.id === 'string' ? review.id : `existing-review-${index}`,
      ...(typeof review.sku === 'string' && review.sku ? { sku: review.sku } : {}),
      rating,
      author,
      title,
      content,
      createdAt: typeof review.createdAt === 'string' ? review.createdAt : '',
      status: status ?? 'approved',
      ...(media?.length ? { media } : {}),
    }];
  });
}

// Only approved reviews may reach the storefront, newest review date first
export function mapPublishedReviews(value: unknown): Review[] {
  return mapReviews(value)
    .filter((review) => review.status === 'approved')
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function mapProductProjection(
  product: ProductProjection,
  locale: string,
  standalonePricesBySku?: ReadonlyMap<string, StandalonePrice>,
): Product {
  const variants = [product.masterVariant, ...(product.variants ?? [])].map((variant) =>
    mapVariant(variant, standalonePricesBySku),
  );
  const brandLogoAsset = product.masterVariant.assets?.find(
    (asset) => asset.key === 'brand-logo' || asset.tags?.includes('brand-logo'),
  );
  return {
    type: 'Product',
    id: product.id,
    name: getLocalizedString(product.name, locale),
    slug: getLocalizedString(product.slug, locale),
    description: getLocalizedString(product.description, locale),
    brand: getTextAttribute(product.masterVariant, 'productBrand', locale),
    brandLogo:
      getAssetUrl(getAttributeValue(product.masterVariant, 'brandLogo')) ??
      getAssetUrl(brandLogoAsset?.sources),
    categories: (product.categories ?? []).map((c) => ({
      id: c.id,
      name: getLocalizedString(c.obj?.name, locale),
      slug: getLocalizedString(c.obj?.slug, locale),
      showInNavigation: true,
    })),
    variants,
    reviews: mapPublishedReviews(
      getAttributeValue(product.masterVariant, 'reviews'),
    ),
  };
}
