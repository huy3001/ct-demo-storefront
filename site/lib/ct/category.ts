import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import type { Category } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { getCatalogApiRoot } from './client';

function getCategoryImage(category: { custom?: { fields: Record<string, unknown> } }): string | undefined {
  const imageUrl = category.custom?.fields.imageUrl;
  return typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl : undefined;
}

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
      description: c.description ? getLocalizedString(c.description, locale) : undefined,
      image: getCategoryImage(c),
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
    description: category.description ? getLocalizedString(category.description, locale) : undefined,
    image: getCategoryImage(category),
    parent: category.parent ? { id: category.parent.id } : undefined,
  };
}
