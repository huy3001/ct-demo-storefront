import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getOrCreateCart } from '@/lib/ct/cart';
import { createCheckoutSession } from '@/lib/ct/checkout';
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
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, locale ?? 'en-US');
    await persistSession(updatedSession);

    if (!cart.lineItems.length) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const result = await createCheckoutSession(cart.id);
    return NextResponse.json(result);
  } catch (err) {
    return apiError(err);
  }
}
