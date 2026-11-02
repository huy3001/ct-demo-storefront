import { AbsoluteDiscountValue, RelativeDiscountValue } from './cart';
import { Category } from './category';
import { Variant } from '@/types/product/Variant';

export interface Money {
  fractionDigits?: number;
  centAmount?: number;
  currencyCode?: string; // The currency code compliant to ISO 4217.
}

export type ProductDiscountValue = AbsoluteDiscountValue | RelativeDiscountValue;

export interface ProductDiscount {
  discountValue?: ProductDiscountValue;
  description?: string;
  name?: string;
}

export interface ProductDiscountedPrice {
  value?: Money;
  discount?: ProductDiscount;
}

export interface Product {
  productId?: string;
  productKey?: string;
  productRef?: string;
  changed?: Date;
  version?: string;
  name?: string;
  slug?: string;
  description?: string;
  categories?: Category[];
  variants: Variant[];
  _url?: string;
}
