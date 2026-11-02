import { COUNTRY_CONFIG, getLocalizedString } from '@/lib/utils';
import { mapProductProjection } from '@/lib/mappers/product';
import { searchProducts } from './product-search';
import { getCatalogApiRoot } from './client';

export interface SearchSuggestions {
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: string[];
  products: Array<{ id: string; name: string; slug: string; image?: string; brand?: string }>;
}

export async function getSearchSuggestions(
  query: string,
  locale: string,
  limit = 5,
): Promise<SearchSuggestions> {
  const apiRoot = getCatalogApiRoot();
  const resolvedLocale = COUNTRY_CONFIG[locale] ? locale : 'en-US';

  const [categoryResponse, productResponse] = await Promise.all([
    apiRoot.categories().get({ queryArgs: { limit: 500 } }).execute(),
    searchProducts(apiRoot, {
      locale: resolvedLocale,
      text: query,
      pageSize: limit,
      facetDefinitions: [],
    }),
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

  const products = productResponse.results
    .map((result) => result.productProjection)
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map((product) => mapProductProjection(product, resolvedLocale))
    .filter((product) => product.slug)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.variants[0]?.images[0],
      brand: product.brand,
    }));

  const brands = [...new Set(products.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)))];

  return { categories, brands, products };
}
