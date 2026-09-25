import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getOrCreateCart, addLineItem, clearCart } from '@/lib/ct/cart';
import { getStorePriceChannel } from '@/lib/ct/store-channel';
import { apiError, localeFromRequest } from '../_utils';

export async function GET(req: NextRequest) {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, localeFromRequest(req));
    await persistSession(updatedSession);
    return NextResponse.json(cart);
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, variantId, quantity, locale } = (await req.json()) as {
      productId: string;
      variantId: number;
      quantity?: number;
      locale?: string;
    };

    const selectedLocale = locale ?? localeFromRequest(req);
    const { apiRoot, session } = await getSessionApiRoot();
    const [cartResult, distributionChannelId] = await Promise.all([
      getOrCreateCart(apiRoot, session, selectedLocale),
      getStorePriceChannel(apiRoot, selectedLocale),
    ]);
    const { cart, session: updatedSession } = cartResult;
    await persistSession(updatedSession);
    const updated = await addLineItem(
      apiRoot,
      cart,
      productId,
      variantId,
      quantity ?? 1,
      distributionChannelId,
    );
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { locale } = (await req.json()) as { locale?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    const { cart, session: updatedSession } = await getOrCreateCart(apiRoot, session, locale ?? localeFromRequest(req));
    await persistSession(updatedSession);
    return NextResponse.json(await clearCart(apiRoot, cart));
  } catch (err) {
    return apiError(err);
  }
}
