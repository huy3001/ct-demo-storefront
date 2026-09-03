import { LineItem } from './LineItem';
import { Address, AccountGroup } from '@/types/account';
import { Payment } from './Payment';
import { DirectDiscount, DiscountCode, DiscountOnTotalPrice } from './Discount';
import { Tax } from './Tax';
import { ShippingInfo } from './ShippingInfo';
import { Money } from '@/types/product';
import { ShippingMethod } from './ShippingMethod';
import { Order } from '@/types/cart/Order';
import { Variant } from '@/types/product';
import { ProjectSettings } from '@/types/ProjectSettings';

export type CartOrigin = 'Customer' | 'Merchant';

export type CartState = 'Active' | 'Frozen' | 'Merged' | 'Ordered';

export interface Cart {
  cartId: string;
  cartVersion?: string;
  lineItems?: LineItem[];
  totalLineItemQuantity?: number;
  email?: string;
  shippingInfo?: ShippingInfo; // Info of the shipping method selected by the customer
  availableShippingMethods?: ShippingMethod[]; // Available shipping methods for this cart
  shippingAddress?: Address;
  billingAddress?: Address;
  itemShippingAddresses?: Address[];
  sum?: Money;
  payments?: Payment[];
  discountCodes?: DiscountCode[];
  directDiscounts?: DirectDiscount[];
  taxed?: Tax;
  origin?: CartOrigin;
  cartState?: CartState;
  accountId?: string;
  storeKey?: string;
  discountOnTotalPrice?: DiscountOnTotalPrice;
  accountGroup?: AccountGroup;
}

export interface CartDetails {
  account?: { email: string };
  shipping?: Address;
  billing?: Address;
}

export interface Transaction {
  isEstimatedShipping?: boolean;
  subtotal: Required<Money>;
  discount: Required<Money>;
  shipping: Required<Money>;
  tax: Required<Money>;
  total: Required<Money>;
}

export interface UseCartReturn {
  data?: Cart;
  totalItems: number;
  isEmpty: boolean;
  isShippingAccurate: boolean;
  hasOutOfStockItems: boolean;
  transaction: Transaction;
  addItem: (variant: Variant, quantity: number) => Promise<void>;
  updateCart: (payload: CartDetails) => Promise<Cart>;
  setShippingMethod: (shippingMethodId: string) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  updateItem: (lineItemId: string, newQuantity: number) => Promise<void>;
  removeDiscountCode?: (discount: DiscountCode) => Promise<void>;
  redeemDiscountCode?: (code: string) => Promise<void>;
  shippingMethods: { data?: ShippingMethod[] };
  orderCart: () => Promise<Order>;
  queryOrder: (orderId: string) => Promise<Order>;
  getOrder: (orderId: string) => Promise<Order>;
  orderHistory?: () => Promise<Order[]>;
  getProjectSettings?: () => Promise<ProjectSettings>;
  resetCart?: () => Promise<void>;
}
