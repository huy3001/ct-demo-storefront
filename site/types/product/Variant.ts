import { ProductDiscountedPrice } from '../cart/Discount';
import { Attributes } from './Attributes';
import type { Image, Price } from '@commercetools/platform-sdk';

export interface Variant {
  id?: string | number;
  sku?: string;
  groupId?: string;
  price?: Price;
  discountedPrice?: ProductDiscountedPrice;
  attributes?: Attributes;
  images?: Image[];
  isOnStock?: boolean;
  restockableInDays?: number;
  availableQuantity?: number;
  isMatchingVariant?: boolean;
}
