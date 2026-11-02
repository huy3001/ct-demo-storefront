import type { ProductSearchRequest } from '@commercetools/platform-sdk';
import { getCatalogApiRoot } from './client';

const SALE_SLUG = 'sale';
const PAGE_SIZE = 100;
const UPDATE_BATCH_SIZE = 10;

async function findSaleCategoryId(): Promise<string> {
  const apiRoot = getCatalogApiRoot();
  const { body } = await apiRoot.categories().get({ queryArgs: { limit: 500 } }).execute();
  const saleCategory = body.results.find((category) =>
    Object.values(category.slug).some((slug) => slug.toLowerCase() === SALE_SLUG),
  );

  if (!saleCategory) throw new Error('Unable to sync sale products: category with slug "sale" was not found.');
  return saleCategory.id;
}

async function searchAllProductIds(query: ProductSearchRequest['query']): Promise<Set<string>> {
  const apiRoot = getCatalogApiRoot();
  const ids = new Set<string>();
  let offset = 0;

  while (true) {
    const { body } = await apiRoot.products().search().post({
      body: { query, limit: PAGE_SIZE, offset },
    }).execute();
    body.results.forEach((result) => ids.add(result.id));
    offset += body.results.length;
    if (offset >= body.total || body.results.length === 0) break;
  }

  return ids;
}

async function updateCategory(productId: string, categoryId: string, add: boolean): Promise<void> {
  const apiRoot = getCatalogApiRoot();
  const { body: product } = await apiRoot.products().withId({ ID: productId }).get().execute();

  await apiRoot.products().withId({ ID: productId }).post({
    body: {
      version: product.version,
      actions: [
        add
          ? { action: 'addToCategory', category: { typeId: 'category', id: categoryId }, staged: false }
          : { action: 'removeFromCategory', category: { typeId: 'category', id: categoryId }, staged: false },
      ],
    },
  }).execute();
}

export interface SaleCategorySyncResult {
  added: number;
  removed: number;
  discountedProducts: number;
}

async function updateInBatches(productIds: string[], categoryId: string, add: boolean): Promise<void> {
  for (let index = 0; index < productIds.length; index += UPDATE_BATCH_SIZE) {
    await Promise.all(
      productIds
        .slice(index, index + UPDATE_BATCH_SIZE)
        .map((productId) => updateCategory(productId, categoryId, add)),
    );
  }
}

export async function syncSaleCategory(): Promise<SaleCategorySyncResult> {
  const categoryId = await findSaleCategoryId();
  const [discountedIds, assignedIds] = await Promise.all([
    searchAllProductIds({ exact: { field: 'variants.prices.discounted', value: true } }),
    searchAllProductIds({ exact: { field: 'categories', value: categoryId } }),
  ]);
  const toAdd = [...discountedIds].filter((id) => !assignedIds.has(id));
  const toRemove = [...assignedIds].filter((id) => !discountedIds.has(id));

  await updateInBatches(toAdd, categoryId, true);
  await updateInBatches(toRemove, categoryId, false);

  return {
    added: toAdd.length,
    removed: toRemove.length,
    discountedProducts: discountedIds.size,
  };
}
