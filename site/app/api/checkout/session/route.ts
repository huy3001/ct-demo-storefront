import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getOrCreateCart, setCheckoutAddresses } from '@/lib/ct/cart';
import { createCheckoutSession } from '@/lib/ct/checkout';
import { getCustomerById } from '@/lib/ct/customer';
import { ensureBusinessUnitCart, QuoteRequestError } from '@/lib/ct/quotes';
import { customerPhone } from '@/lib/customer-profile';
import { apiError } from '../../_utils';

/**
 * Creates a commercetools Checkout Session for the shopper's active cart.
 * Called as late as possible — when the shopper lands on the checkout page —
 * since Checkout Sessions expire.
 */
export async function POST(req: NextRequest) {
  try {
    const { locale } = (await req.json().catch(() => ({}))) as { locale?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart: activeCart, session: updatedSession } = await getOrCreateCart(apiRoot, session, locale ?? 'en-US');
    await persistSession(updatedSession);

    if (!activeCart.lineItems.length) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    // Orders must belong to the customer's business unit so its approval rules apply.
    const cart = session.customerId
      ? await ensureBusinessUnitCart(apiRoot, session.customerId, activeCart)
      : activeCart;
    if (cart.id !== activeCart.id) {
      await persistSession({ ...updatedSession, cartId: cart.id });
    }

    let checkoutCart = cart;
    let profileContact: { firstName?: string; lastName?: string; email?: string; phone?: string } | undefined;
    if (session.customerId) {
      const customer = await getCustomerById(apiRoot, session.customerId);
      profileContact = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customerPhone(customer) || undefined,
      };

      // find() preserves address-book order if malformed/external customer data
      // contains more than one matching entry.
      const savedDefaultShippingAddress = customer.addresses.find(
        (address) => address.id === customer.defaultShippingAddressId,
      );
      const savedDefaultBillingAddress = customer.addresses.find(
        (address) => address.id === customer.defaultBillingAddressId,
      );
      const withProfileContact = (address: typeof savedDefaultShippingAddress) =>
        address
          ? {
              ...address,
              firstName: address.firstName || customer.firstName,
              lastName: address.lastName || customer.lastName,
              email: address.email || customer.email,
              phone: address.phone || customerPhone(customer) || undefined,
            }
          : undefined;

      checkoutCart = await setCheckoutAddresses(
        apiRoot,
        cart,
        withProfileContact(savedDefaultShippingAddress),
        withProfileContact(savedDefaultBillingAddress),
      );
    }

    const result = await createCheckoutSession(checkoutCart.id);
    return NextResponse.json({ ...result, profileContact });
  } catch (err) {
    if (err instanceof QuoteRequestError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return apiError(err);
  }
}
