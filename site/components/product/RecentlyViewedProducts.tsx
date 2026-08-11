'use client';

import { useCallback, useSyncExternalStore } from 'react';
import RelatedProductsSlider from './RelatedProductsSlider';
import { getRecentlyViewedProducts, RECENTLY_VIEWED_EVENT } from '@/lib/recently-viewed';

const EMPTY_PRODUCTS: ReturnType<typeof getRecentlyViewedProducts> = [];

export default function RecentlyViewedProducts({ locale }: { locale: string }) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener('storage', onStoreChange);
    window.addEventListener(RECENTLY_VIEWED_EVENT, onStoreChange);
    return () => {
      window.removeEventListener('storage', onStoreChange);
      window.removeEventListener(RECENTLY_VIEWED_EVENT, onStoreChange);
    };
  }, []);
  const getSnapshot = useCallback(() => getRecentlyViewedProducts(locale), [locale]);
  const products = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_PRODUCTS);

  if (products.length === 0) return null;

  return (
    <RelatedProductsSlider
      products={products}
      locale={locale}
      title="Recently viewed products"
      headingId="recently-viewed-products-heading"
    />
  );
}
