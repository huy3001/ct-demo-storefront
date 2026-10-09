import { NextRequest, NextResponse } from 'next/server';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { mapProductProjection } from '@/lib/mappers/product';
import { getCatalogApiRoot } from '@/lib/ct/client';
import { searchProducts } from '@/lib/ct/product-search';
import { apiError, localeFromRequest } from '../_utils';
import type { ProductProjection } from '@commercetools/platform-sdk';

type SearchType = 'name' | 'sku';

function escapePredicate(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 100) ?? '';
  const searchType = request.nextUrl.searchParams.get('type') as SearchType | null;
  const requestLocale = localeFromRequest(request);
  const locale = COUNTRY_CONFIG[requestLocale] ? requestLocale : 'en-US';

  if (!query) return NextResponse.json({ products: [] });
  if (searchType && searchType !== 'name' && searchType !== 'sku') {
    return NextResponse.json({ message: 'Invalid search type.' }, { status: 400 });
  }

  try {
    const apiRoot = getCatalogApiRoot();
    let projections: ProductProjection[] = [];
    let matchedExactSku = false;

    if (searchType !== 'name') {
      const { body } = await apiRoot.productProjections().get({
        queryArgs: {
          where: `masterVariant(sku="${escapePredicate(query)}") or variants(sku="${escapePredicate(query)}")`,
          limit: 10,
        },
      }).execute();
      projections = body.results;
      matchedExactSku = projections.length > 0;
    }

    if (!projections.length && searchType !== 'sku') {
      const results = await searchProducts(apiRoot, {
        locale,
        text: query,
        pageSize: 10,
        facetDefinitions: [],
      });
      projections = results.results
        .map((result) => result.productProjection)
        .filter((projection): projection is NonNullable<typeof projection> => Boolean(projection));
    }

    const products = projections.map((projection) => {
      const product = mapProductProjection(projection, locale);
      const variantsWithSku = product.variants.filter((variant) => variant.sku);
      const skuMatches = variantsWithSku.filter((variant) =>
        variant.sku.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      );
      const matchingVariants = matchedExactSku
        ? skuMatches.filter(
            (variant) =>
              variant.sku.toLocaleLowerCase() === query.toLocaleLowerCase(),
          )
        : skuMatches.length > 0
          ? skuMatches
          : variantsWithSku;
      return {
        productId: product.id,
        name: product.name,
        variants: matchingVariants.map(({ id, sku }) => ({ id, sku })),
      };
    }).filter((product) => product.variants.length > 0);

    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error);
  }
}
