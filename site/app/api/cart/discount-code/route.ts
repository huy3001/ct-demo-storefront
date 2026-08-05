import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getOrCreateCart, applyDiscountCode, removeDiscountCode } from '@/lib/ct/cart';
import { apiError, localeFromRequest } from '../../_utils';

export async function POST(req: NextRequest) {
  try {
    const { code, locale } = (await req.json()) as { code: string; locale?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, locale ?? localeFromRequest(req));
    await persistSession(updatedSession);
    const updated = await applyDiscountCode(apiRoot, cart, code);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { discountCodeId, locale } = (await req.json()) as { discountCodeId: string; locale?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, locale ?? localeFromRequest(req));
    await persistSession(updatedSession);
    const updated = await removeDiscountCode(apiRoot, cart, discountCodeId);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}
