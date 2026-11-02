import { unstable_cache } from 'next/cache';
import type { AttributeDefinition, AttributeType, SearchFieldType } from '@commercetools/platform-sdk';
import { getLocalizedString } from '@/lib/utils';
import { getCatalogApiRoot } from './client';

export interface FilterableFacetDefinition {
  key: string;
  label: string;
  field: string;
  fieldType?: SearchFieldType;
  termLabels?: Record<string, string>;
}

export const CATEGORY_FACET: FilterableFacetDefinition = {
  key: 'category',
  label: 'Category',
  field: 'categories',
};

function distinctAttributeType(type: AttributeType): {
  fieldType: SearchFieldType;
  enumType?: Extract<AttributeType, { name: 'enum' | 'lenum' }>;
  usesKeyField: boolean;
} | null {
  const isSet = type.name === 'set';
  const valueType = isSet ? type.elementType : type;

  if (!['boolean', 'enum', 'lenum', 'text', 'ltext'].includes(valueType.name)) return null;

  const isEnum = valueType.name === 'enum' || valueType.name === 'lenum';
  const baseType = isEnum ? 'enum' : valueType.name;
  return {
    fieldType: `${isSet ? 'set_' : ''}${baseType}` as SearchFieldType,
    enumType: isEnum ? valueType : undefined,
    usesKeyField: isEnum,
  };
}

function mapAttribute(attribute: AttributeDefinition, locale: string): FilterableFacetDefinition | null {
  if (!attribute.isSearchable) return null;
  const type = distinctAttributeType(attribute.type);
  if (!type) return null;

  let termLabels: Record<string, string> | undefined;
  if (type.enumType?.name === 'enum') {
    termLabels = Object.fromEntries(type.enumType.values.map((value) => [value.key, value.label]));
  } else if (type.enumType?.name === 'lenum') {
    termLabels = Object.fromEntries(
      type.enumType.values.map((value) => [value.key, getLocalizedString(value.label, locale)])
    );
  }

  return {
    key: attribute.name,
    label: getLocalizedString(attribute.label, locale) || attribute.name,
    field: `variants.attributes.${attribute.name}${type.usesKeyField ? '.key' : ''}`,
    fieldType: type.fieldType,
    termLabels,
  };
}

const getCachedAttributeFacets = unstable_cache(
  async (locale: string): Promise<FilterableFacetDefinition[]> => {
    const { body } = await getCatalogApiRoot().productTypes().get({ queryArgs: { limit: 500 } }).execute();
    const byName = new Map<string, AttributeDefinition>();

    for (const productType of body.results) {
      for (const attribute of productType.attributes ?? []) {
        if (attribute.name !== CATEGORY_FACET.key && !byName.has(attribute.name)) {
          byName.set(attribute.name, attribute);
        }
      }
    }

    return [...byName.values()]
      .map((attribute) => mapAttribute(attribute, locale))
      .filter((facet): facet is FilterableFacetDefinition => Boolean(facet));
  },
  ['searchable-product-attribute-facets'],
  { revalidate: 3600 }
);

export async function getFilterableFacets(locale: string): Promise<FilterableFacetDefinition[]> {
  return [CATEGORY_FACET, ...(await getCachedAttributeFacets(locale))];
}
