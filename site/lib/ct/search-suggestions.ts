import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { COUNTRY_CONFIG, getLocalizedString } from '@/lib/utils';
import { getCatalogApiRoot } from './client';

export interface SearchSuggestions {
  categories: Array<{ id: string; name: string; slug: string }>;
  products: Array<{ id: string; name: string; slug: string; image?: string }>;
}

export async function getSearchSuggestions(
  query: string,
  locale: string,
  limit = 5,
): Promise<SearchSuggestions> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const resolvedLocale = COUNTRY_CONFIG[locale] ? locale : 'en-US';
  const { currency, country } = COUNTRY_CONFIG[resolvedLocale];

  const [categoryResponse, productResponse] = await Promise.all([
    apiRoot.categories().get({ queryArgs: { limit: 500 } }).execute(),
    apiRoot.productProjections().search().get({
      queryArgs: {
        [`text.${resolvedLocale}`]: query,
        fuzzy: true,
        limit,
        priceCurrency: currency,
        priceCountry: country,
      },
    }).execute(),
  ]);

  const normalizedQuery = query.toLocaleLowerCase(resolvedLocale);
  const categories = categoryResponse.body.results
    .map((category) => ({
      id: category.id,
      name: getLocalizedString(category.name, resolvedLocale),
      slug: getLocalizedString(category.slug, resolvedLocale),
    }))
    .filter((category) => category.slug && category.name.toLocaleLowerCase(resolvedLocale).includes(normalizedQuery))
    .slice(0, limit);

  const products = productResponse.body.results.map((product) => ({
    id: product.id,
    name: getLocalizedString(product.name, resolvedLocale),
    slug: getLocalizedString(product.slug, resolvedLocale),
    image: product.masterVariant.images?.[0]?.url,
  })).filter((product) => product.slug);

  return { categories, products };
}
