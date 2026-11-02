import { NextRequest, NextResponse } from 'next/server';
import type { BaseAddress, ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getCustomerById } from '@/lib/ct/customer';
import { getOrCreateCart } from '@/lib/ct/cart';
import {
  createCustomerQuoteRequest,
  createQuoteCartInBusinessUnit,
  QuoteRequestError,
  setQuoteCartShippingMethod,
  updateQuoteCartAddresses,
} from '@/lib/ct/quotes';
import { customerPhone } from '@/lib/customer-profile';
import { apiError, localeFromRequest } from '../_utils';

type ShippingMethodOption = {
  id: string;
  name: string;
  description?: string;
  centAmount: number;
  currencyCode: string;
};

function shippingMethodOptions(
  apiRoot: ByProjectKeyRequestBuilder,
  cartId: string,
): Promise<ShippingMethodOption[]> {
  return apiRoot.shippingMethods().matchingCart().get({
    queryArgs: { cartId },
  }).execute().then(({ body }) =>
    body.results.flatMap((method) => {
      const rate = method.zoneRates
        .flatMap((zoneRate) => zoneRate.shippingRates)
        .find((shippingRate) => shippingRate.isMatching);
      if (!rate) return [];
      return [{
        id: method.id,
        name: method.name,
        description: method.localizedDescription?.['en'] ?? method.description,
        centAmount: rate.price.centAmount,
        currencyCode: rate.price.currencyCode,
      }];
    }),
  );
}

function hasCompleteAddress(address: BaseAddress | undefined): address is BaseAddress {
  return Boolean(
    address?.firstName?.trim() &&
      address.lastName?.trim() &&
      address.streetName?.trim() &&
      address.city?.trim() &&
      address.postalCode?.trim() &&
      address.country?.trim(),
  );
}

export async function GET(req: NextRequest) {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Sign in to request a quote.' }, { status: 401 });
    }

    const { cart, session: updatedSession } = await getOrCreateCart(
      apiRoot,
      session,
      localeFromRequest(req),
    );
    await persistSession(updatedSession);
    if (cart.lineItems.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty.' }, { status: 400 });
    }

    const customer = await getCustomerById(apiRoot, session.customerId);
    const methods = cart.shippingAddress
      ? await shippingMethodOptions(apiRoot, cart.id)
      : [];
    const defaultShippingAddress = customer.addresses.find(
      (address) => address.id === customer.defaultShippingAddressId,
    );
    const defaultBillingAddress = customer.addresses.find(
      (address) => address.id === customer.defaultBillingAddressId,
    );

    return NextResponse.json({
      cart,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customerPhone(customer),
        addresses: customer.addresses,
        defaultShippingAddressId: customer.defaultShippingAddressId,
        defaultBillingAddressId: customer.defaultBillingAddressId,
        defaultShippingAddress,
        defaultBillingAddress,
      },
      shippingMethods: methods,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      shippingAddress?: BaseAddress;
      billingAddress?: BaseAddress;
      shippingMethodId?: string;
      locale?: string;
    };
    if (!hasCompleteAddress(body.shippingAddress) || !hasCompleteAddress(body.billingAddress)) {
      return NextResponse.json(
        { message: 'Enter a complete shipping and billing address.' },
        { status: 400 },
      );
    }

    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Sign in to request a quote.' }, { status: 401 });
    }
    const { cart, session: updatedSession } = await getOrCreateCart(
      apiRoot,
      session,
      body.locale ?? localeFromRequest(req),
    );
    await persistSession(updatedSession);
    const { cart: quoteCart, businessUnitKey } = await createQuoteCartInBusinessUnit(
      apiRoot,
      session.customerId,
      cart,
    );
    await persistSession({ ...updatedSession, cartId: quoteCart.id });
    let updatedCart = await updateQuoteCartAddresses(
      apiRoot,
      session.customerId,
      businessUnitKey,
      quoteCart,
      body.shippingAddress,
      body.billingAddress,
    );

    let methods = await shippingMethodOptions(apiRoot, updatedCart.id);
    if (body.shippingMethodId) {
      if (!methods.some(({ id }) => id === body.shippingMethodId)) {
        return NextResponse.json(
          { message: 'Select an available delivery method.' },
          { status: 400 },
        );
      }
      updatedCart = await setQuoteCartShippingMethod(
        apiRoot,
        session.customerId,
        businessUnitKey,
        updatedCart,
        body.shippingMethodId,
      );
      methods = await shippingMethodOptions(apiRoot, updatedCart.id);
    }

    return NextResponse.json({ cart: updatedCart, shippingMethods: methods });
  } catch (error) {
    if (error instanceof QuoteRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { purchaseOrderNumber, locale } = (await req.json()) as {
      purchaseOrderNumber?: string;
      locale?: string;
    };
    const poNumber = purchaseOrderNumber?.trim();
    if (!poNumber) {
      return NextResponse.json({ message: 'Enter a PO Number to continue.' }, { status: 400 });
    }
    if (poNumber.length > 100) {
      return NextResponse.json(
        { message: 'PO Number must be 100 characters or fewer.' },
        { status: 400 },
      );
    }

    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Sign in to request a quote.' }, { status: 401 });
    }
    const { cart, session: updatedSession } = await getOrCreateCart(
      apiRoot,
      session,
      locale ?? localeFromRequest(req),
    );
    if (cart.lineItems.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty.' }, { status: 400 });
    }
    if (!hasCompleteAddress(cart.shippingAddress) || !hasCompleteAddress(cart.billingAddress)) {
      return NextResponse.json(
        { message: 'Complete both addresses before submitting the quote request.' },
        { status: 400 },
      );
    }
    if (!cart.shippingInfo?.shippingMethod?.id) {
      return NextResponse.json(
        { message: 'Select a delivery method before submitting the quote request.' },
        { status: 400 },
      );
    }
    if (cart.discountCodes.length > 0) {
      return NextResponse.json(
        { message: 'Remove discount codes before requesting a quote.' },
        { status: 400 },
      );
    }

    const { cart: quoteCart, businessUnitKey } = await createQuoteCartInBusinessUnit(
      apiRoot,
      session.customerId,
      cart,
      true,
    );
    await persistSession({ ...updatedSession, cartId: quoteCart.id });

    const quoteRequest = await createCustomerQuoteRequest(
      apiRoot,
      session.customerId,
      quoteCart,
      poNumber,
      businessUnitKey,
    );
    await persistSession({ ...updatedSession, cartId: undefined });
    return NextResponse.json({ quoteRequestId: quoteRequest.id });
  } catch (error) {
    if (error instanceof QuoteRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return apiError(error);
  }
}
