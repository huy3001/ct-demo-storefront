import { unstable_cache } from 'next/cache';
import { getLocalizedString } from '@/lib/utils';
import { getCatalogApiRoot } from './client';

export const getProductAttributeLabels = unstable_cache(
  async (locale: string): Promise<Record<string, string>> => {
    const { body } = await getCatalogApiRoot().productTypes().get({ queryArgs: { limit: 500 } }).execute();
    const labels = new Map<string, string>();

    for (const productType of body.results) {
      for (const attribute of productType.attributes ?? []) {
        if (!labels.has(attribute.name)) {
          labels.set(attribute.name, getLocalizedString(attribute.label, locale) || attribute.name);
        }
      }
    }

    return Object.fromEntries(labels);
  },
  ['product-attribute-labels'],
  { revalidate: 3600 }
);
