import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { signUpCustomer } from '@/lib/ct/customer';
import { apiError } from '../../_utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = (await req.json()) as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    };

    const { apiRoot, session } = await getSessionApiRoot();
    const signInResult = await signUpCustomer(apiRoot, { email, password, firstName, lastName }, session.anonymousId);

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
