import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import type { Product } from '@/lib/types';
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
