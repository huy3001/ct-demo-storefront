import { PaymentMethod } from '@/components/ui/organisms/order-payment-section/types';
import { ShippingMethod } from '@/types/entity/cart';
import { LineItem } from '@/types/cart/LineItem';
import { Order, ShipmentState } from '@/types/entity/order';
import { Product } from '@/types/entity/product';
import { Reference } from '@/types/reference';
import type { Price } from '@commercetools/platform-sdk';

export const linkReferenceOne: Reference = {
  link: '/',
  openInNewWindow: false,
  type: 'link',
};

export const linkReferenceTwo: Reference = {
  type: 'page-folder',
  pageFolder: {
    pageFolderId: 'b27378fbe05639798e9b23399a373bc0',
    name: 'Link',
    _urls: { de_CH: '/men', fr_CH: '/men', it_CH: '/men', de_LI: '/men' },
    _url: '/men',
  },
  openInNewWindow: false,
};

export const lineItems: LineItem[] = [
  {
    lineItemId: '2234-3333-0001',
    count: 3,
    name: 'Item number 1',
    price: {
      id: 'price-id',
      value: {
        centAmount: 9999,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      },
    },
    //taxedPrice: {},
    variant: {
      id: '1',
      sku: 'GRCG-01',
      images: [
        {
          url: 'https://images.cdn.europe-west1.gcp.commercetools.com/a79de97d-1218-4218-a80f-29109baae7b0/sample-data_goodstor-rFyoxXme.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
      ],
      attributes: {
        productspec:
          '- Set of 5 glasses\n- Imported crystal\n- Gold polish on the rims',
      },
      price: {
        id: 'price-id',
        value: {
          centAmount: 2799,
          currencyCode: 'USD',
          fractionDigits: 2,
          type: 'centPrecision',
        },
      },
    },
  },
  {
    lineItemId: '2234-3333-0002',
    count: 3,
    name: 'Item number 2',
    price: {
      id: 'price-id',
      value: {
        centAmount: 9999,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      },
    },
    //taxedPrice: {},
    variant: {
      id: '1',
      sku: 'GPC-01',
      images: [
        {
          url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_393014656-_k6QZQka.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
        {
          url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_428905072-yDh7ZXzp.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
      ],
      attributes: {
        color: 'silver',
        colorlabel: 'Silver',
        productspec:
          '- Velvet fabric\n- Cotton lining\n- Pillow case comes with zip for easy removal\n- Pillow not included\n- Washable',
      },
      price: {
        id: 'price-id',
        value: {
          centAmount: 1999,
          currencyCode: 'USD',
          fractionDigits: 2,
          type: 'centPrecision',
        },
      },
      isOnStock: true,
    },
  },
  {
    lineItemId: '2234-3333-0003',
    count: 3,
    name: 'Item number 3',
    price: {
      id: 'price-id',
      value: {
        centAmount: 9999,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      },
    },
    //taxedPrice: {},
    variant: {
      id: '1',
      sku: 'TTSS-01',
      images: [
        {
          url: 'https://95dfeffbda96db953574-a645c2420e466d4e59dabbadeebf9a9e.ssl.cf3.rackcdn.com/AdobeStock_305670594-Svpdrrw1.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
        {
          url: 'https://95dfeffbda96db953574-a645c2420e466d4e59dabbadeebf9a9e.ssl.cf3.rackcdn.com/AdobeStock_305670456-7LLjHhlw.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
        {
          url: 'https://95dfeffbda96db953574-a645c2420e466d4e59dabbadeebf9a9e.ssl.cf3.rackcdn.com/AdobeStock_305671593-0TIoFOzl.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
      ],
      attributes: {
        productspec:
          '- Three seater sofa\n- Velvet upholstery\n- Assembly on site',
        color: '#09331c',
        colorlabel: 'Emerald',
        finish: '#202120',
        finishlabel: 'Espresso',
      },
      price: {
        id: 'price-id',
        value: {
          centAmount: 239900,
          currencyCode: 'USD',
          fractionDigits: 2,
          type: 'centPrecision',
        },
      },
      discountedPrice: {
        value: {
          fractionDigits: 2,
          centAmount: 215910,
          currencyCode: 'USD',
        },
        discount: {
          discountValue: { type: 'relative', value: 50 },
        },
      },
      isOnStock: true,
    },
  },
  {
    lineItemId: '2234-3333-0004',
    count: 3,
    name: 'Item number 4',
    price: {
      id: 'price-id',
      value: {
        centAmount: 9999,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      },
    },
    //taxedPrice: {},
    variant: {
      id: '1',
      sku: 'ALC-01',
      images: [
        {
          url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_378975371-myB5QCrw.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
      ],
      attributes: {
        color: 'lightpink',
        colorlabel: 'Soft Pink',
        finishlabel: 'Brass',
        finish: 'goldenrod',
        productspec:
          '- Comes with matching throw pillow\n- Velvet upholstery\n- Pre-assembled',
      },
      price: {
        id: 'price-id',
        value: {
          centAmount: 75000,
          currencyCode: 'USD',
          fractionDigits: 2,
          type: 'centPrecision',
        },
      },
      isOnStock: true,
    },
  },
  {
    lineItemId: '2234-3333-0005',
    count: 3,
    name: 'Item number 5',
    price: {
      id: 'price-id',
      value: {
        centAmount: 9999,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      },
    },
    //taxedPrice: {},
    variant: {
      id: '1',
      sku: 'MMST-01',
      images: [
        {
          url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_308570068-ftaFzBEg.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
        {
          url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_314247429-Qt_DKygA.jpeg',
          dimensions: {
            w: 1920,
            h: 1080,
          },
        },
      ],
      attributes: {
        color: 'white',
        colorlabel: 'White',
        finish: 'white',
        finishlabel: 'Marble',
        productspec: '- 4 legged side table\n- Walnut legs\n- Pre-assembled',
      },
      price: {
        id: 'price-id',
        value: {
          centAmount: 12000,
          currencyCode: 'USD',
          fractionDigits: 2,
          type: 'centPrecision',
        },
      },
      isOnStock: true,
    },
  },
];

export const products: Product[] = [
  {
    name: 'Product 1',
    variants: [
      {
        id: '1',
        sku: 'MMST-01',
        images: [
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_308570068-ftaFzBEg.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_314247429-Qt_DKygA.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          color: 'white',
          colorlabel: 'White',
          finish: 'white',
          finishlabel: 'Marble',
          productspec: '- 4 legged side table\n- Walnut legs\n- Pre-assembled',
        },
        price: {
          id: 'price-id',
          value: {
            centAmount: 12000,
            currencyCode: 'USD',
            fractionDigits: 2,
            type: 'centPrecision',
          },
        },
        isOnStock: true,
      },
      {
        id: '2',
        sku: 'MMST-02',
        images: [
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_308570077-dEUwL6Ta.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          finishlabel: 'Walnut',
          color: '#d69169',
          colorlabel: 'Golden Pecan',
          finish: '#d69169',
          productspec: '- 4 legged side table\n- Walnut legs\n- Pre-assembled',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 4999,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
        isOnStock: true,
      },
    ],
  },
  {
    name: 'Product 2',
    variants: [
      {
        id: '1',
        sku: 'ALC-01',
        images: [
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_378975371-myB5QCrw.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          color: 'lightpink',
          colorlabel: 'Soft Pink',
          finishlabel: 'Brass',
          finish: 'goldenrod',
          productspec:
            '- Comes with matching throw pillow\n- Velvet upholstery\n- Pre-assembled',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 75000,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
        isOnStock: true,
      },
    ],
  },
  {
    name: 'Product 3',
    variants: [
      {
        id: '1',
        sku: 'TTSS-01',
        images: [
          {
            url: 'https://95dfeffbda96db953574-a645c2420e466d4e59dabbadeebf9a9e.ssl.cf3.rackcdn.com/AdobeStock_305670594-Svpdrrw1.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
          {
            url: 'https://95dfeffbda96db953574-a645c2420e466d4e59dabbadeebf9a9e.ssl.cf3.rackcdn.com/AdobeStock_305670456-7LLjHhlw.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
          {
            url: 'https://95dfeffbda96db953574-a645c2420e466d4e59dabbadeebf9a9e.ssl.cf3.rackcdn.com/AdobeStock_305671593-0TIoFOzl.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          productspec:
            '- Three seater sofa\n- Velvet upholstery\n- Assembly on site',
          color: '#09331c',
          colorlabel: 'Emerald',
          finish: '#202120',
          finishlabel: 'Espresso',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 239900,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
        discountedPrice: {
          value: {
            fractionDigits: 2,
            centAmount: 215910,
            currencyCode: 'USD',
          },
          discount: {
            discountValue: { type: 'relative', value: 50 },
          },
        },
        isOnStock: true,
      },
    ],
  },
  {
    name: 'Product 4',
    variants: [
      {
        id: '1',
        sku: 'GPC-01',
        images: [
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_393014656-_k6QZQka.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_428905072-yDh7ZXzp.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          color: 'silver',
          colorlabel: 'Silver',
          productspec:
            '- Velvet fabric\n- Cotton lining\n- Pillow case comes with zip for easy removal\n- Pillow not included\n- Washable',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 1999,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
        isOnStock: true,
      },
      {
        id: '2',
        sku: 'GPC-02',
        images: [
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_428905591-cqjZDCoa.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_428905072-jCMMBAQN.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          color: 'lightpink',
          colorlabel: 'Salmon Gold',
          productspec:
            '- Velvet fabric\n- Cotton lining\n- Pillow case comes with zip for easy removal\n- Pillow not included\n- Washable',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 1999,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
        isOnStock: true,
      },
      {
        id: '3',
        sku: 'GPC-03',
        images: [
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_428905063-7BiCdYkA.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
          {
            url: 'https://2eca75039cf911b9bbe5-79bfd3e36f011d786971804e873c4354.ssl.cf3.rackcdn.com/AdobeStock_428905072-f5lSi4ra.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          color: 'tan',
          colorlabel: 'Ivory Tan',
          productspec:
            '- Velvet fabric\n- Cotton lining\n- Pillow case comes with zip for easy removal\n- Pillow not included\n- Washable',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 1999,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
        isOnStock: true,
      },
    ],
  },
  {
    name: 'Product 5',
    variants: [
      {
        id: '1',
        sku: 'GRCG-01',
        images: [
          {
            url: 'https://images.cdn.europe-west1.gcp.commercetools.com/a79de97d-1218-4218-a80f-29109baae7b0/sample-data_goodstor-rFyoxXme.jpeg',
            dimensions: {
              w: 1920,
              h: 1080,
            },
          },
        ],
        attributes: {
          productspec:
            '- Set of 5 glasses\n- Imported crystal\n- Gold polish on the rims',
        },
        price: {
          id: 'price-id',
          value: {
            fractionDigits: 2,
            centAmount: 2799,
            currencyCode: 'USD',
            type: 'centPrecision',
          },
        },
      },
    ],
  },
];

const defaultPrice: Price = {
  id: 'price-id',
  value: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    fractionDigits: 2,
    centAmount: 0,
  },
};

export const cartLineItems = lineItems.map((item) => ({
  id: item.lineItemId ?? '',
  productId: item.productId ?? '',
  name: {
    en: item.name ?? '',
  },
  productSlug: {
    en: item.productSlug ?? '',
  },
  quantity: item.count ?? 0,
  price: item.price ?? defaultPrice,
  totalPrice: item.totalPrice ?? {
    type: 'centPrecision',
    currencyCode: 'EUR',
    fractionDigits: 2,
    centAmount: (item.price?.value.centAmount ?? 0) * (item.count ?? 0),
  },
  productType: {
    typeId: 'product-type' as const,
    id: item.productId ?? '',
  },
  discountedPricePerQuantity: [],
  taxedPricePortions: [],
  state: [],
  perMethodTaxRate: [],
  priceMode: 'Platform',
  lineItemMode: 'Standard',
  variant: {
    id: Number(item.variant?.id ?? 1),
    sku: item.variant?.sku,
    images: item.variant?.images ?? [],
    attributes: [],
  },
}));

export const shippingMethods: ShippingMethod[] = [
  {
    shippingMethodId: 'method-01',
    name: 'UPS',
    description: 'Shipping method description',
  },
];

export const orders: Order[] = [
  {
    id: 'cart-0000001',
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastModifiedAt: '2024-01-01T00:00:00.000Z',
    origin: 'Customer',
    cartState: 'Ordered',
    taxMode: 'Platform',
    priceRoundingMode: 'HalfEven',
    taxRoundingMode: 'HalfEven',
    taxCalculationMode: 'LineItemLevel',
    inventoryMode: 'None',
    shippingMode: 'Single',
    shipping: [],
    customLineItems: [],
    itemShippingAddresses: [],
    discountCodes: [],
    directDiscounts: [],
    refusedGifts: [],
    customerEmail: 'spider.man@gmail.com',
    // cartId: '0000001',
    orderId: 'ORD-00000001',
    orderState: 'Open',
    /*subtotal: {
      centAmount: 99999,
      currencyCode: 'EUR',
      fractionDigits: 2,
    },*/
    // availableShippingMethods: [
    //   {
    //     shippingMethodId: 'method-01',
    //     name: 'UPS',
    //     description: 'Shipping method description',
    //   },
    // ],

    shippingAddress: {
      // addressId: 'ADDR-00001',
      city: 'Berlin',
      country: 'Germany',
      firstName: 'Peter Parker',
      lastName: 'Parker',
      postalCode: '42069',
      streetName: 'Alexander Platz',
      phone: '+555 556955555',
      // isDefaultShippingAddress: true,
      // isDefaultBillingAddress: true,
      streetNumber: 'st.47',
    },
    shippingInfo: {
      shippingMethod: {
        typeId: 'shipping-method',
        id: 'method-01',
      },
      shippingMethodName: 'UPS',
      price: {
        centAmount: 9999,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      },
      shippingRate: {
        price: {
          centAmount: 9999,
          currencyCode: 'EUR',
          fractionDigits: 2,
          type: 'centPrecision',
        },
        tiers: [
          {
            type: 'CartClassification',
            value: 'standard',
            price: {
              centAmount: 9999,
              currencyCode: 'EUR',
            },
          },
        ],
      },
      shippingMethodState: 'MatchesCart',
    },
    shipmentState: 'Shipped' as ShipmentState,
    totalPrice: {
      centAmount: 99999,
      currencyCode: 'EUR',
      fractionDigits: 2,
      type: 'centPrecision',
    },
    payments: [
      {
        //cardSummary: '0420',
        // paymentId: 'payment-01',
        id: '000001',
        cardNumber: '4111111111111111',
        cardExpiryMonth: { name: '03', value: '03' },
        cardExpiryYear: { name: '27', value: '27' },
        paymentProvider: 'VISA',
        paymentMethod: 'VISA',
        // amountPlanned: {
        //   centAmount: 99999,
        //   currencyCode: 'EUR',
        //   fractionDigits: 2,
        // },
        paymentStatus: 'PAID',
      },
    ],

    lineItems: cartLineItems,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    name: 'Visa',
    image: {
      media: {
        _type: 'Frontastic\\Backstage\\MediaApiBundle\\Domain\\MediaApi\\Media',
        mediaId: 'rh4uscyphitwjmm2lb7g',
        resourceType: 'image',
        name: 'Visa-Emblem',
        filename: '',
        description: '',
        file: 'https://res.cloudinary.com/dlwdq84ig/image/upload/v1704277232/rh4uscyphitwjmm2lb7g.jpg',
        size: 88583,
        width: 3840,
        height: 2160,
        alt: '',
        format: 'jpg',
        created: '2024-01-03T10:20:32+00:00',
        updateDate: null,
        metaData: [],
        tags: ['__none'],
      },
    },
  },
  {
    name: 'MasterCard',
    image: {
      media: {
        _type: 'Frontastic\\Backstage\\MediaApiBundle\\Domain\\MediaApi\\Media',
        mediaId: 'yzykpfpqh8doyuwhraze',
        resourceType: 'image',
        name: 'Mastercard-Logo',
        filename: '',
        description: '',
        file: 'https://res.cloudinary.com/dlwdq84ig/image/upload/v1704277235/yzykpfpqh8doyuwhraze.png',
        size: 19116,
        width: 3840,
        height: 2160,
        alt: '',
        format: 'png',
        created: '2024-01-03T10:20:35+00:00',
        updateDate: null,
        metaData: [],
        tags: ['__none'],
      },
    },
  },
  {
    name: 'Apple Pay',
    image: {
      media: {
        _type: 'Frontastic\\Backstage\\MediaApiBundle\\Domain\\MediaApi\\Media',
        mediaId: 'avvlzr9w4oubmulzmxik',
        resourceType: 'image',
        name: 'Apple-pay-logo-F68C9AC252-seeklogo.com',
        filename: '',
        description: '',
        file: 'https://res.cloudinary.com/dlwdq84ig/image/upload/v1704277237/avvlzr9w4oubmulzmxik.png',
        size: 4472,
        width: 300,
        height: 142,
        alt: '',
        format: 'png',
        created: '2024-01-03T10:20:37+00:00',
        updateDate: null,
        metaData: [],
        tags: ['__none'],
      },
    },
  },
  {
    name: 'Paypal',
    image: {
      media: {
        _type: 'Frontastic\\Backstage\\MediaApiBundle\\Domain\\MediaApi\\Media',
        mediaId: 'ml2wbnfrjxhyrj8iu6eu',
        resourceType: 'image',
        name: 'PayPal-Symbol',
        filename: '',
        description: '',
        file: 'https://res.cloudinary.com/dlwdq84ig/image/upload/v1704277181/ml2wbnfrjxhyrj8iu6eu.png',
        size: 14918,
        width: 1024,
        height: 1024,
        alt: '',
        format: 'png',
        created: '2024-01-03T10:19:41+00:00',
        updateDate: null,
        metaData: [],
        tags: ['__none'],
      },
    },
  },
];
