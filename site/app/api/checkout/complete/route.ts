import { NextRequest, NextResponse } from 'next/server';
import { ensureSession, persistSession } from '@/lib/ct/session';
import { apiError } from '../../_utils';

export async function POST(req: NextRequest) {
  try {
    const { cartId } = (await req.json()) as { cartId?: string };
    const session = await ensureSession();

    // Only clear the cart that produced this checkout. This prevents a delayed
    // completion event from removing a newer cart started in another tab.
    if (cartId && session.cartId === cartId) {
      const sessionWithoutCart = { ...session };
      delete sessionWithoutCart.cartId;
      await persistSession(sessionWithoutCart);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
