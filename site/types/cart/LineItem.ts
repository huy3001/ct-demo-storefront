import { DiscountedPricePerCount, ProductDiscountedPrice } from './Discount';
import { Variant } from '../product';
import { Tax } from './Tax';
import { TaxRate } from './TaxRate';
import type { CentPrecisionMoney, Price } from '@commercetools/platform-sdk';

export interface LineItem {
  lineItemId?: string;
  productId?: string;
  productSlug?: string;
  name?: string;
  type?: string;
  count?: number;
  price?: Price; // Price of a single item
  discountedPrice?: ProductDiscountedPrice; // Discounted price per item
  discountedPricePerCount?: DiscountedPricePerCount[];
  totalPrice?: CentPrecisionMoney;
  taxed?: Tax;
  taxRate?: TaxRate;
  variant?: Variant;
  isGift?: boolean;
  _url?: string;
}
