import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot } from '@/lib/ct/session';
import { addWishlistLineItem, removeAllWishlistLineItems, removeWishlistLineItem } from '@/lib/ct/wishlist';
import { apiError, localeFromRequest } from '../../../_utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { productId, variantId, quantity, locale } = (await req.json()) as {
      productId: string;
      variantId: number;
      quantity?: number;
      locale?: string;
    };

    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const wishlist = await addWishlistLineItem(
      apiRoot,
      session.customerId,
      id,
      locale ?? localeFromRequest(req),
      productId,
      variantId,
      quantity ?? 1
    );
    return NextResponse.json(wishlist);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { lineItemId, locale, removeAll } = (await req.json()) as {
      lineItemId?: string;
      locale?: string;
      removeAll?: boolean;
    };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    if (!removeAll && !lineItemId) {
      return NextResponse.json({ message: 'A wishlist item is required' }, { status: 400 });
    }
    const wishlist = removeAll
      ? await removeAllWishlistLineItems(apiRoot, session.customerId, id, locale ?? localeFromRequest(req))
      : await removeWishlistLineItem(apiRoot, session.customerId, id, locale ?? localeFromRequest(req), lineItemId!);
    return NextResponse.json(wishlist);
  } catch (err) {
    return apiError(err);
  }
}
