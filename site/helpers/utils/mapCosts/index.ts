import { UseCartReturn } from '@/types/cart/Cart';
import type { Cart } from '@commercetools/platform-sdk';

type MapCosts = (props: { cart?: Partial<Cart>; currency?: string }) => UseCartReturn['transaction'];

const mapCosts: MapCosts = ({ cart: data, currency = 'USD' }) => {
  if (!data?.totalPrice?.centAmount) {
    return {
      subtotal: { centAmount: 0, currencyCode: currency, fractionDigits: 2 },
      discount: { centAmount: 0, currencyCode: currency, fractionDigits: 2 },
      tax: { centAmount: 0, currencyCode: currency, fractionDigits: 2 },
      shipping: { centAmount: 0, currencyCode: currency, fractionDigits: 2 },
      total: { centAmount: 0, currencyCode: currency, fractionDigits: 2 },
    };
  }

  const currencyCode = data.totalPrice?.currencyCode ?? currency;
  const fractionDigits = data.totalPrice?.fractionDigits ?? 2;

  const totalAmount = data.totalPrice?.centAmount as number;
  const subTotalAmount = (data.lineItems ?? []).reduce((acc, curr) => {
    // if (curr.isGift) {
    //   return acc;
    // }

    return (
      acc +
      (curr.price?.value?.centAmount || 0) * (curr.quantity as number) -
      (curr.taxRate?.includedInPrice
        ? curr.taxedPrice?.totalTax?.centAmount || 0
        : 0)
    );
  }, 0);

  const discountedAmount =
    (data.discountOnTotalPrice?.discountedAmount?.centAmount || 0) +
    (data.lineItems ?? []).reduce((acc, curr) => {
      // if (curr.isGift) {
      //   return acc;
      // }

      return acc + ((curr.price?.value?.centAmount || 0) * (curr.quantity as number) - (curr.totalPrice?.centAmount || 0));
    }, 0);

  const excludedTaxes =
    (data.lineItems ?? [])
      .filter((item) => !item.taxRate?.includedInPrice)
      .reduce((acc, curr) => acc + (curr.taxedPrice?.totalTax?.centAmount ?? 0), 0) +
    (!data.shippingInfo?.taxRate?.includedInPrice ? (data.shippingInfo?.taxedPrice?.totalTax?.centAmount ?? 0) : 0);

  const totalTax =
    totalAmount > 0 ? (data.taxedPrice?.totalTax?.centAmount ?? 0) : 0;

  const totalShipping =
    totalAmount > 0
      ? (data.shippingInfo?.price?.centAmount || 0) -
          (data.shippingInfo?.taxRate?.includedInPrice
            ? data.shippingInfo?.taxedPrice?.totalTax?.centAmount || 0
            : 0)
      : 0;

  const isEstimatedShipping = !data.shippingInfo;

  return {
    subtotal: {
      centAmount: subTotalAmount,
      currencyCode,
      fractionDigits,
    },
    discount: {
      centAmount: discountedAmount,
      currencyCode,
      fractionDigits,
    },
    shipping: {
      centAmount: totalShipping,
      currencyCode,
      fractionDigits,
    },
    isEstimatedShipping,
    tax: {
      centAmount: totalTax,
      currencyCode,
      fractionDigits,
    },
    total: {
      centAmount: totalAmount + (isEstimatedShipping ? totalShipping : 0) + excludedTaxes,
      currencyCode,
      fractionDigits,
    },
  };
};

export default mapCosts;
