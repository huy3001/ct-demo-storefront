import type { Product, Variant } from '@/lib/types';

export interface AddToCartOverlayContextShape {
  show: (product: Product, variant: Variant, count: number) => void;
  hide: () => void;
  fetchRelatedProducts: (product: Product) => Promise<void>;
}

export interface StateProduct extends Product {
  count: number;
}
