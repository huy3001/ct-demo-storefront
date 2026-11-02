export const QUOTE_STATUSES = [
  'Accepted',
  'Declined',
  'Declined for Renegotiation',
  'Renegotiating',
  'Renegotiated',
  'In Progress',
  'Cancelled',
  'Closed',
  'Rejected',
  'Submitted',
  'Withdrawn',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export type QuoteLineItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  priceCentAmount: number;
  originalPriceCentAmount?: number;
  totalCentAmount: number;
  currencyCode: string;
  imageUrl?: string;
};

export type QuoteActivityItem = {
  id: string;
  label: string;
};

export type QuoteAddress = {
  firstName?: string;
  lastName?: string;
  company?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type Quote = {
  id: string;
  status: QuoteStatus;
  createdAt: string;
  lastModifiedAt: string;
  businessUnit: string;
  subtotalCentAmount: number;
  taxCentAmount: number;
  discountCentAmount: number;
  totalCentAmount: number;
  currencyCode: string;
  poNumber: string;
  owner: string;
  customerEmail?: string;
  deliveryAddress?: QuoteAddress;
  billingAddress?: QuoteAddress;
  shippingMethodName?: string;
  activity: QuoteActivityItem[];
  items: QuoteLineItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isQuote(value: unknown): value is Quote {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    QUOTE_STATUSES.some((status) => status === value.status) &&
    typeof value.createdAt === 'string' &&
    typeof value.lastModifiedAt === 'string' &&
    typeof value.businessUnit === 'string' &&
    typeof value.subtotalCentAmount === 'number' &&
    typeof value.taxCentAmount === 'number' &&
    typeof value.discountCentAmount === 'number' &&
    typeof value.totalCentAmount === 'number' &&
    typeof value.currencyCode === 'string' &&
    typeof value.poNumber === 'string' &&
    typeof value.owner === 'string' &&
    (value.customerEmail === undefined ||
      typeof value.customerEmail === 'string') &&
    (value.deliveryAddress === undefined || isRecord(value.deliveryAddress)) &&
    (value.billingAddress === undefined || isRecord(value.billingAddress)) &&
    (value.shippingMethodName === undefined ||
      typeof value.shippingMethodName === 'string') &&
    Array.isArray(value.activity) &&
    value.activity.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.label === 'string',
    ) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.sku === 'string' &&
        typeof item.quantity === 'number' &&
        typeof item.priceCentAmount === 'number' &&
        typeof item.totalCentAmount === 'number' &&
        typeof item.currencyCode === 'string' &&
        (item.originalPriceCentAmount === undefined ||
          typeof item.originalPriceCentAmount === 'number') &&
        (item.imageUrl === undefined || typeof item.imageUrl === 'string'),
    )
  );
}

export function isQuoteList(value: unknown): value is Quote[] {
  return Array.isArray(value) && value.every(isQuote);
}
