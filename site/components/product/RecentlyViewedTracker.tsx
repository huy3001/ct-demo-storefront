'use client';

import { useEffect } from 'react';
import type { Product } from '@/lib/types';
import { rememberViewedProduct } from '@/lib/recently-viewed';

export default function RecentlyViewedTracker({ product, locale }: { product: Product; locale: string }) {
  useEffect(() => {
    rememberViewedProduct(product, locale);
  }, [locale, product]);

  return null;
}
