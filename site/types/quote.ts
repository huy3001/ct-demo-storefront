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

export type Quote = {
  id: string;
  status: QuoteStatus;
  createdAt: string;
  lastModifiedAt: string;
  businessUnit: string;
  totalCentAmount: number;
  currencyCode: string;
  poNumber: string;
  owner: string;
  activity: QuoteActivityItem[];
  items: QuoteLineItem[];
};
