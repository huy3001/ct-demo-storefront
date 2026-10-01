import type { Quote, QuoteStatus } from '@/types/quote';

const truckImage =
  'https://images.cdn.europe-west1.gcp.commercetools.com/a79de97d-1218-4218-a80f-29109baae7b0/sample-data_goodstor-rFyoxXme.jpeg';

function buildQuote(
  partial: Pick<Quote, 'id' | 'status' | 'businessUnit' | 'totalCentAmount' | 'poNumber' | 'owner'> & {
    createdAt?: string;
    lastModifiedAt?: string;
  },
): Quote {
  const createdAt = partial.createdAt ?? '2026-09-30T10:00:00.000Z';
  const lastModifiedAt = partial.lastModifiedAt ?? createdAt;

  return {
    id: partial.id,
    status: partial.status,
    createdAt,
    lastModifiedAt,
    businessUnit: partial.businessUnit,
    totalCentAmount: partial.totalCentAmount,
    currencyCode: 'USD',
    poNumber: partial.poNumber,
    owner: partial.owner,
    activity: [
      { id: `${partial.id}-activity-1`, label: 'Quote request submitted' },
      { id: `${partial.id}-activity-2`, label: 'Awaiting reply from seller' },
    ],
    items: [
      {
        id: `${partial.id}-item-1`,
        name: 'V456 ST Rigid Dump Truck',
        sku: 'v456-st-2015',
        quantity: 1,
        priceCentAmount: 2_805_000,
        originalPriceCentAmount: 3_300_000,
        totalCentAmount: 2_805_000,
        currencyCode: 'USD',
        imageUrl: truckImage,
      },
    ],
  };
}

const statuses: QuoteStatus[] = [
  'Submitted',
  'In Progress',
  'Accepted',
  'Declined',
  'Declined for Renegotiation',
  'Renegotiating',
  'Cancelled',
  'Closed',
  'Rejected',
  'Withdrawn',
  'Submitted',
  'In Progress',
  'Accepted',
  'Submitted',
  'Closed',
];

const businessUnits = ['Digitas', 'North Plant', 'West Division', 'APAC Hub', 'EMEA Ops'];

export const MOCK_QUOTES: Quote[] = statuses.map((status, index) => {
  const n = index + 1;
  return buildQuote({
    id: `6a33f97a-5f36-48b7-9cc3-1d5beaf04${String(n).padStart(3, '0')}`,
    status,
    businessUnit: businessUnits[index % businessUnits.length],
    totalCentAmount: 326_600_000 + n * 1_250_000,
    poNumber: String(987650 + n),
    owner: 'Huy Nguyen',
    createdAt: `2026-09-${String(Math.max(1, 30 - (index % 28))).padStart(2, '0')}T10:00:00.000Z`,
    lastModifiedAt: `2026-09-${String(Math.max(1, 30 - (index % 20))).padStart(2, '0')}T15:30:00.000Z`,
  });
});

export function getQuoteById(quoteId: string): Quote | undefined {
  return MOCK_QUOTES.find((quote) => quote.id === quoteId);
}
