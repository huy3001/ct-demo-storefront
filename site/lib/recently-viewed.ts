import type { Product } from '@/lib/types';

export const RECENTLY_VIEWED_EVENT = 'recently-viewed-products-changed';
const MAX_RECENT_PRODUCTS = 8;

function storageKey(locale: string) {
  return `recently-viewed-products:${locale}`;
}

let cachedKey = '';
let cachedValue = '';
let cachedProducts: Product[] = [];

export function getRecentlyViewedProducts(locale: string): Product[] {
  if (typeof window === 'undefined') return [];
  const key = storageKey(locale);
  const value = window.localStorage.getItem(key) ?? '';
  if (key === cachedKey && value === cachedValue) return cachedProducts;

  cachedKey = key;
  cachedValue = value;
  try {
    const parsed = JSON.parse(value || '[]');
    cachedProducts = Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    cachedProducts = [];
  }
  return cachedProducts;
}

export function rememberViewedProduct(product: Product, locale: string) {
  const products = getRecentlyViewedProducts(locale).filter((item) => item.id !== product.id);
  const value = JSON.stringify([product, ...products].slice(0, MAX_RECENT_PRODUCTS));
  window.localStorage.setItem(storageKey(locale), value);
  cachedValue = '';
  window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
}
