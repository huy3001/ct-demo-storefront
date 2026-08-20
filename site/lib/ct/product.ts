import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import type { Product, ProductBrand } from '@/lib/types';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { mapProductProjection } from '@/lib/mappers/product';
import { getCatalogApiRoot } from './client';

export async function getProductBySlug(slug: string, locale: string): Promise<Product | null> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        where: `slug(${locale}="${slug}")`,
        priceCurrency: currency,
        priceCountry: country,
        limit: 1,
      },
    })
    .execute();

  const projection = body.results[0];
  if (!projection) return null;
  return mapProductProjection(projection, locale);
}

export async function getFeaturedProducts(locale: string, limit = 8): Promise<Product[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        priceCurrency: currency,
        priceCountry: country,
        limit,
        sort: 'createdAt desc',
      },
    })
    .execute();

  return body.results.map((p) => mapProductProjection(p, locale));
}

export async function getProductBrands(locale: string): Promise<ProductBrand[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        priceCurrency: currency,
        priceCountry: country,
        limit: 500,
      },
    })
    .execute();

  const brands = new Map<string, ProductBrand>();
  for (const projection of body.results) {
    const product = mapProductProjection(projection, locale);
    if (!product.brand) continue;

    const key = product.brand.toLocaleLowerCase(locale);
    const existing = brands.get(key);
    if (!existing || (!existing.logo && product.brandLogo)) {
      brands.set(key, { name: product.brand, logo: product.brandLogo });
    }
  }

  return [...brands.values()].sort((a, b) => a.name.localeCompare(b.name, locale));
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  locale: string,
  limit = 8,
): Promise<Product[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
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
        limit,
        sort: 'createdAt desc',
      },
    })
    .execute();

  return body.results.map((product) => mapProductProjection(product, locale));
}

export async function getRelatedProducts(
  categoryId: string,
  currentProductId: string,
  locale: string,
  limit = 8,
): Promise<Product[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { currency, country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];

  const { body } = await apiRoot
    .productProjections()
    .get({
      queryArgs: {
        where: `categories(id="${categoryId}") and id != "${currentProductId}"`,
        priceCurrency: currency,
        priceCountry: country,
        limit,
        sort: 'createdAt desc',
      },
    })
    .execute();

  return body.results.map((product) => mapProductProjection(product, locale));
}
