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
    const { productId: requestedProductId, variantId: requestedVariantId, sku, quantity, locale } = (await req.json()) as {
      productId?: string;
      variantId?: number;
      sku?: string;
      quantity?: number;
      locale?: string;
    };

    if (quantity !== undefined && (!Number.isSafeInteger(quantity) || quantity < 1)) {
      return NextResponse.json({ message: 'Quantity must be a positive whole number.' }, { status: 400 });
    }

    const selectedLocale = locale ?? localeFromRequest(req);
    const { apiRoot, session } = await getSessionApiRoot();
    let productId = requestedProductId;
    let variantId = requestedVariantId;

    if (sku?.trim()) {
      const selectedSku = sku.trim();
      const escapedSku = selectedSku.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
      const { body: projections } = await apiRoot.productProjections().get({
        queryArgs: {
          where: `masterVariant(sku="${escapedSku}") or variants(sku="${escapedSku}")`,
          limit: 10,
        },
      }).execute();
      const matchedProduct = projections.results
        .map((projection) => ({
          productId: projection.id,
          variant: [projection.masterVariant, ...(projection.variants ?? [])]
            .find((candidate) => candidate.sku === selectedSku),
        }))
        .find((product) => product.variant);

      if (!matchedProduct?.variant) {
        return NextResponse.json({ message: `No product found for SKU "${selectedSku}".` }, { status: 404 });
      }

      productId = matchedProduct.productId;
      variantId = matchedProduct.variant.id;
    }

    if (!productId || typeof variantId !== 'number' || !Number.isSafeInteger(variantId)) {
      return NextResponse.json({ message: 'A valid product and variant are required.' }, { status: 400 });
    }

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
