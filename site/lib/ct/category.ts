import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import type { Category } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { getCatalogApiRoot } from './client';

export async function getCategoryTree(locale: string): Promise<Category[]> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { body } = await apiRoot
    .categories()
    .get({ queryArgs: { limit: 500, sort: 'orderHint asc' } })
    .execute();

  const byId = new Map<string, Category>();
  for (const c of body.results) {
    byId.set(c.id, {
      id: c.id,
      name: getLocalizedString(c.name, locale),
      slug: getLocalizedString(c.slug, locale),
      parent: c.parent ? { id: c.parent.id } : undefined,
      children: [],
    });
  }

  const roots: Category[] = [];
  for (const category of byId.values()) {
    if (category.parent && byId.has(category.parent.id)) {
      byId.get(category.parent.id)!.children!.push(category);
    } else {
      roots.push(category);
    }
  }
  return roots;
}

export async function getCategoryBySlug(slug: string, locale: string): Promise<Category | null> {
  const apiRoot: ByProjectKeyRequestBuilder = getCatalogApiRoot();
  const { body } = await apiRoot
    .categories()
    .get({ queryArgs: { where: `slug(${locale}="${slug}")`, limit: 1 } })
    .execute();
  const category = body.results[0];
  if (!category) return null;
  return {
    id: category.id,
    name: getLocalizedString(category.name, locale),
    slug: getLocalizedString(category.slug, locale),
    parent: category.parent ? { id: category.parent.id } : undefined,
  };
}
