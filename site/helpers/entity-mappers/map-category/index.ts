import { Category } from '@/types/product';
import { getLocalizationInfo } from '@/project.config';
import { Category as EntityCategory } from '@/types/entity/category';

export const mapCategotry = (category: Category, { locale = 'en' }: { locale?: string } = {}): EntityCategory => {
  return {
    ...category,
    _urls: Object.entries(category._url ?? {}).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key.split('-')[0]] = value;
        acc[key.toLowerCase()] = value;
      }
      return acc;
    }, {}),
    _url: (category._url ?? {})[getLocalizationInfo(locale).locale],
    descendants: (category.descendants ?? []).map((subCategory) => mapCategotry(subCategory, { locale })),
  };
};
