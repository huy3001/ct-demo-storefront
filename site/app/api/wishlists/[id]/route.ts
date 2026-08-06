import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot } from '@/lib/ct/session';
import { deleteWishlist, getWishlistById, renameWishlist } from '@/lib/ct/wishlist';
import { apiError, localeFromRequest } from '../../_utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const wishlist = await getWishlistById(apiRoot, session.customerId, id, localeFromRequest(req));
    return NextResponse.json(wishlist);
  } catch (err) {
    return apiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, locale } = (await req.json()) as { name: string; locale?: string };
    const normalizedName = name?.trim();
    if (!normalizedName) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 });
    }

    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

    const wishlist = await renameWishlist(apiRoot, session.customerId, id, locale ?? localeFromRequest(req), normalizedName);
    return NextResponse.json(wishlist);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    await deleteWishlist(apiRoot, session.customerId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
