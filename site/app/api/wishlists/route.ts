import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot } from '@/lib/ct/session';
import { createWishlist, getWishlists } from '@/lib/ct/wishlist';
import { apiError, localeFromRequest } from '../_utils';

export async function GET(req: NextRequest) {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const wishlists = await getWishlists(apiRoot, session.customerId, localeFromRequest(req));
    return NextResponse.json(wishlists);
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, locale } = (await req.json()) as { name?: string; locale?: string };
    const normalizedName = name?.trim();
    if (!normalizedName) {
      return NextResponse.json({ message: 'Wishlist name is required' }, { status: 400 });
    }
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

    const wishlist = await createWishlist(
      apiRoot,
      session.customerId,
      locale ?? localeFromRequest(req),
      normalizedName
    );
    return NextResponse.json(wishlist, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
