import type { Category } from '@/lib/types';

export function categoryLabels(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.flatMap((category) => [
    [category.id, category.name],
    ...Object.entries(categoryLabels(category.children ?? [])),
  ]));
}

export function categoryIdsByName(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.flatMap((category) => [
    [category.name, category.id],
    ...Object.entries(categoryIdsByName(category.children ?? [])),
  ]));
}

export function isColorCodeFacet(key: string): boolean {
  return ['colorcode', 'finishcode', 'finishlabel', 'searchfinish'].includes(
    key.replace(/[\s_-]/g, '').toLowerCase(),
  );
}
