import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getOrCreateCart, changeLineItemQuantity, removeLineItem } from '@/lib/ct/cart';
import { apiError, localeFromRequest } from '../../../_utils';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { quantity, locale } = (await req.json()) as { quantity: number; locale?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, locale ?? localeFromRequest(req));
    await persistSession(updatedSession);
    const updated = await changeLineItemQuantity(apiRoot, cart, id, quantity);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, localeFromRequest(req));
    await persistSession(updatedSession);
    const updated = await removeLineItem(apiRoot, cart, id);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}
