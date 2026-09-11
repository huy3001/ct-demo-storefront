import type {
  Attribute,
  ProductVariantAvailability,
} from '@commercetools/platform-sdk';

export interface Price {
  centAmount: number;
  currencyCode: string;
  discounted?: { centAmount: number; currencyCode: string };
}

export interface Variant {
  id: number;
  sku: string;
  images: string[];
  price?: Price;
  prices: Price[];
  attributes: Attribute[];
  availability?: ProductVariantAvailability;
}

export interface Product {
  type: 'Product';
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  brandLogo?: string;
  categories: Array<{ id: string }>;
  variants: Variant[];
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  author: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ProductBrand {
  name: string;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  showInNavigation: boolean;
  parent?: { id: string };
  children?: Category[];
}

export interface FacetTerm {
  term: string;
  count: number;
  label?: string;
}

export interface Facet {
  key: string;
  label: string;
  terms: FacetTerm[];
}

export interface SearchResult {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
  facets: Facet[];
}

export interface WishlistItem {
  lineItemId: string;
  productId: string;
  variantId?: number;
  quantity: number;
  name: string;
  image?: string;
  price?: Price;
  slug?: string;
}

export interface Wishlist {
  id: string;
  version: number;
  name: string;
  createdAt: string;
  lineItems: WishlistItem[];
}
