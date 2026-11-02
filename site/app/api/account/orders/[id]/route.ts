import { NextRequest, NextResponse } from 'next/server';
import type { ProductVariant, ProductVariantAvailability } from '@commercetools/platform-sdk';
import { getSessionApiRoot, persistSession } from '@/lib/ct/session';
import { getCustomerOrder } from '@/lib/ct/customer';
import { addLineItems, getOrCreateCart } from '@/lib/ct/cart';
import { apiError, localeFromRequest } from '../../../_utils';
import { COUNTRY_CONFIG } from '@/lib/utils';

interface ReorderNotice {
  productId: string;
  name: string;
  requestedQuantity: number;
  addedQuantity: number;
  reason: 'unavailable' | 'quantity-reduced';
}

function availableQuantity(availability?: ProductVariantAvailability): number | undefined {
  if (!availability) return undefined;
  if (availability.channels) {
    return Object.values(availability.channels).reduce(
      (sum, channel) => sum + (channel.availableQuantity ?? 0),
      0,
    );
  }
  if (availability.isOnStock === false) return 0;
  return availability.availableQuantity;
}

function findVariant(masterVariant: ProductVariant, variants: ProductVariant[], variantId: number) {
  return masterVariant.id === variantId ? masterVariant : variants.find((variant) => variant.id === variantId);
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const order = await getCustomerOrder(apiRoot, session.customerId, id);
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { locale } = (await req.json()) as { locale?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

    const order = await getCustomerOrder(apiRoot, session.customerId, id);
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const requestedLocale = locale ?? localeFromRequest(req);
    const localeConfig = COUNTRY_CONFIG[requestedLocale] ?? COUNTRY_CONFIG['en-US'];
    const { cart, session: updatedSession } = await getOrCreateCart(
      apiRoot,
      session,
      requestedLocale,
    );
    await persistSession(updatedSession);

    const notices: ReorderNotice[] = [];
    const additions: Array<{ productId: string; variantId: number; quantity: number }> = [];

    for (const lineItem of order.lineItems) {
      const name = lineItem.name[requestedLocale] ?? Object.values(lineItem.name)[0] ?? 'Item';
      try {
        const { body: product } = await apiRoot
          .productProjections()
          .withId({ ID: lineItem.productId })
          .get({
            queryArgs: {
              staged: false,
              priceCurrency: localeConfig.currency,
              priceCountry: localeConfig.country,
            },
          })
          .execute();
        const variant = findVariant(product.masterVariant, product.variants, lineItem.variant.id);
        if (!product.published || !variant || !variant.scopedPrice) {
          notices.push({ productId: lineItem.productId, name, requestedQuantity: lineItem.quantity, addedQuantity: 0, reason: 'unavailable' });
          continue;
        }

        const inCart = cart.lineItems
          .filter((item) => item.productId === lineItem.productId && item.variant.id === lineItem.variant.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        const alreadyPlanned = additions
          .filter((item) => item.productId === lineItem.productId && item.variantId === lineItem.variant.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        const stock = availableQuantity(variant.availability);
        const quantity = stock === undefined
          ? lineItem.quantity
          : Math.max(0, Math.min(lineItem.quantity, stock - inCart - alreadyPlanned));
        if (quantity === 0) {
          notices.push({ productId: lineItem.productId, name, requestedQuantity: lineItem.quantity, addedQuantity: 0, reason: 'quantity-reduced' });
          continue;
        }
        additions.push({ productId: lineItem.productId, variantId: lineItem.variant.id, quantity });
        if (quantity < lineItem.quantity) {
          notices.push({ productId: lineItem.productId, name, requestedQuantity: lineItem.quantity, addedQuantity: quantity, reason: 'quantity-reduced' });
        }
      } catch (err) {
        if ((err as { statusCode?: number }).statusCode !== 404) throw err;
        notices.push({ productId: lineItem.productId, name, requestedQuantity: lineItem.quantity, addedQuantity: 0, reason: 'unavailable' });
      }
    }

    const updatedCart = await addLineItems(apiRoot, cart, additions);
    return NextResponse.json({ cart: updatedCart, notices, addedItemCount: additions.reduce((sum, item) => sum + item.quantity, 0) });
  } catch (err) {
    return apiError(err);
  }
}
