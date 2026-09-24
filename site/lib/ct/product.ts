import type {
  AttributeDefinitionDraft,
  ByProjectKeyRequestBuilder,
  ProductProjection,
} from '@commercetools/platform-sdk';
import type { Product, ProductBrand, Review } from '@/lib/types';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { mapProductProjection } from '@/lib/mappers/product';
import { mapReviews } from '@/lib/mappers/product';
import { getCatalogApiRoot } from './client';
import { getStandalonePricesBySku } from './standalone-prices';
import { getStorePriceChannel } from './store-channel';

async function mapProducts(
  apiRoot: ByProjectKeyRequestBuilder,
  products: ProductProjection[],
  locale: string,
  currency: string,
  country: string,
  priceChannel?: string,
): Promise<Product[]> {
  const standalonePricesBySku = await getStandalonePricesBySku(
    apiRoot,
    products,
    currency,
    country,
    priceChannel,
  );
  return products.map((product) =>
    mapProductProjection(product, locale, standalonePricesBySku),
  );
}

const REVIEWS_ATTRIBUTE: AttributeDefinitionDraft = {
  name: 'reviews',
  label: { 'en-US': 'Reviews' },
  type: { name: 'text' },
  isRequired: false,
  attributeConstraint: 'SameForAll',
  isSearchable: false,
  inputHint: 'MultiLine',
};

async function ensureReviewsAttribute(
  apiRoot: ByProjectKeyRequestBuilder,
  productTypeId: string,
): Promise<void> {
  const { body: productType } = await apiRoot
    .productTypes()
    .withId({ ID: productTypeId })
    .get()
    .execute();

  if (productType.attributes?.some(({ name }) => name === REVIEWS_ATTRIBUTE.name)) return;

  await apiRoot
    .productTypes()
    .withId({ ID: productTypeId })
    .post({
      body: {
        version: productType.version,
        actions: [{
          action: 'addAttributeDefinition',
          attribute: REVIEWS_ATTRIBUTE,
        }],
      },
    })
    .execute();
}

export async function getProductBySlug(slug: string, locale: string): Promise<Product | null> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
  const priceChannel = await getStorePriceChannel(apiRoot, locale);

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        where: `slug(${locale}="${slug}")`,
        priceCurrency: currency,
        priceCountry: country,
        ...(priceChannel ? { priceChannel } : {}),
        limit: 1,
      },
    })
    .execute();

  const projection = body.results[0];
  if (!projection) return null;
  return (
    await mapProducts(
      apiRoot,
      [projection],
      locale,
      currency,
      country,
      priceChannel,
    )
  )[0];
}

export async function getFeaturedProducts(locale: string, limit = 8): Promise<Product[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
  const priceChannel = await getStorePriceChannel(apiRoot, locale);

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        priceCurrency: currency,
        priceCountry: country,
        ...(priceChannel ? { priceChannel } : {}),
        limit,
        sort: 'createdAt desc',
      },
    })
    .execute();

  return mapProducts(
    apiRoot,
    body.results,
    locale,
    currency,
    country,
    priceChannel,
  );
}

export async function getProductBrands(locale: string): Promise<ProductBrand[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
  const priceChannel = await getStorePriceChannel(apiRoot, locale);
  const brands = new Map<string, ProductBrand>();
  const limit = 500;
  let offset = 0;

  while (true) {
    const { body } = await apiRoot
      .productProjections()
      .get({
        queryArgs: {
          priceCurrency: currency,
          priceCountry: country,
          ...(priceChannel ? { priceChannel } : {}),
          limit,
          offset,
        },
      })
      .execute();

    for (const projection of body.results) {
      const product = mapProductProjection(projection, locale);
      if (!product.brand) continue;

      const key = product.brand.toLocaleLowerCase(locale);
      const existing = brands.get(key);
      if (!existing || (!existing.logo && product.brandLogo)) {
        brands.set(key, { name: product.brand, logo: product.brandLogo });
      }
    }

    if (body.results.length < limit) break;
    offset += body.results.length;
  }

  return [...brands.values()].sort((a, b) =>
    a.name.localeCompare(b.name, locale, {
      sensitivity: 'base',
    }),
  );
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  locale: string,
  limit = 8,
): Promise<Product[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
  const priceChannel = await getStorePriceChannel(apiRoot, locale);
  const categoryResponse = await apiRoot
    .categories()
    .get({ queryArgs: { where: `slug(${locale}="${categorySlug}")`, limit: 1 } })
    .execute();
  const category = categoryResponse.body.results[0];

  if (!category) return [];

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        where: `categories(id="${category.id}")`,
        priceCurrency: currency,
        priceCountry: country,
        ...(priceChannel ? { priceChannel } : {}),
        limit,
        sort: 'createdAt desc',
      },
    })
    .execute();

  return mapProducts(
    apiRoot,
    body.results,
    locale,
    currency,
    country,
    priceChannel,
  );
}

export async function getRelatedProducts(
  categoryId: string,
  currentProductId: string,
  locale: string,
  limit = 8,
): Promise<Product[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
  const priceChannel = await getStorePriceChannel(apiRoot, locale);

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        where: `categories(id="${categoryId}") and id != "${currentProductId}"`,
        priceCurrency: currency,
        priceCountry: country,
        ...(priceChannel ? { priceChannel } : {}),
        limit,
        sort: 'createdAt desc',
      },
    })
    .execute();

  return mapProducts(
    apiRoot,
    body.results,
    locale,
    currency,
    country,
    priceChannel,
  );
}

export async function createProductReview(
  productId: string,
  input: Pick<Review, 'rating' | 'author' | 'title' | 'content' | 'media'>,
): Promise<Review> {
  const apiRoot = getCatalogApiRoot();
  const { body: product } = await apiRoot
    .products()
    .withId({ ID: productId })
    .get()
    .execute();
  await ensureReviewsAttribute(apiRoot, product.productType.id);

  const reviewsAttribute = product.masterData.current.masterVariant.attributes
    ?.find((attribute) => attribute.name === 'reviews');
  const existingReviews = mapReviews(reviewsAttribute?.value);
  const review: Review = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  await apiRoot
    .products()
    .withId({ ID: productId })
    .post({
      body: {
        version: product.version,
        actions: [{
          action: 'setAttribute',
          variantId: product.masterData.current.masterVariant.id,
          name: 'reviews',
          value: JSON.stringify([...existingReviews, review]),
          staged: false,
        }],
      },
    })
    .execute();

  return review;
}
