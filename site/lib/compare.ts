import type { Product } from '@/lib/types';

export const COMPARE_PRODUCTS_EVENT = 'compare-products-changed';
export const MAX_COMPARE_PRODUCTS = 10;

function storageKey(locale: string) {
  return `compare-products:${locale}`;
}

export function getComparedProducts(locale: string): Product[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(storageKey(locale));
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

function saveComparedProducts(products: Product[], locale: string) {
  window.localStorage.setItem(storageKey(locale), JSON.stringify(products));
  window.dispatchEvent(new Event(COMPARE_PRODUCTS_EVENT));
}

export function addComparedProduct(product: Product, locale: string): boolean {
  const products = getComparedProducts(locale);
  if (products.some((item) => item.id === product.id)) return false;
  if (products.length >= MAX_COMPARE_PRODUCTS) return false;

  saveComparedProducts([...products, product], locale);
  return true;
}

export function removeComparedProduct(productId: string, locale: string) {
  saveComparedProducts(
    getComparedProducts(locale).filter((product) => product.id !== productId),
    locale,
  );
}

export function clearComparedProducts(locale: string) {
  saveComparedProducts([], locale);
}
