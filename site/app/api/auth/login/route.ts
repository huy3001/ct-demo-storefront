import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { signInCustomer } from '@/lib/ct/customer';
import { apiError } from '../../_utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email: string; password: string };
    const { apiRoot, session } = await getSessionApiRoot();

    // Passing the shopper's anonymousId merges their guest cart into the customer's cart.
    const signInResult = await signInCustomer(apiRoot, email, password, session.anonymousId);

    await persistSession({
      ...session,
      customerId: signInResult.customer.id,
      email: signInResult.customer.email,
      cartId: signInResult.cart?.id,
    });

    return NextResponse.json({ customer: signInResult.customer, cart: signInResult.cart });
  } catch (err) {
    return apiError(err);
  }
}
