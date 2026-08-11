'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';

export default function CartPage() {
  const { locale } = useParams<{ locale: string }>();
  const {
    cart,
    isLoading,
    changeQuantity,
    removeItem,
    clearCart,
    applyDiscountCode,
  } = useCart();
  const [code, setCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState<'idle' | 'updating' | 'error'>(
    'idle',
  );

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-charcoal-light">Loading cart…</div>;
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-xl font-semibold">Your cart is empty</h1>
          <Link href="/category/all" locale={locale} className="text-terra hover:underline">
            Continue shopping
          </Link>
        </div>
        <RecentlyViewedProducts locale={locale} />
      </div>
    );
  }

  async function onApplyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setCodeStatus('loading');
    try {
      await applyDiscountCode(code.trim());
      setCode('');
      setCodeStatus('idle');
    } catch {
      setCodeStatus('error');
    }
  }

  async function onSaveQuantity(lineItemId: string) {
    setCartStatus('updating');
    try {
      await changeQuantity(lineItemId, quantity);
      setEditingItemId(null);
      setCartStatus('idle');
    } catch {
      setCartStatus('error');
    }
  }

  async function onClearCart() {
    setCartStatus('updating');
    try {
      await clearCart();
      setCartStatus('idle');
    } catch {
      setCartStatus('error');
    }
  }

  const subtotal = cart.lineItems.reduce(
    (sum, item) => sum + item.price.value.centAmount * item.quantity,
    0,
  );
  const discountedLineItemsTotal = cart.lineItems.reduce(
    (sum, item) => sum + item.totalPrice.centAmount,
    0,
  );
  const tax = cart.taxedPrice
    ? cart.taxedPrice.totalGross.centAmount -
      cart.taxedPrice.totalNet.centAmount
    : null;
  const discount = Math.max(
    0,
    subtotal -
      discountedLineItemsTotal +
      (cart.discountOnTotalPrice?.discountedAmount.centAmount ?? 0),
  );
  const currency = cart.totalPrice.currencyCode;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <button
          type="button"
          onClick={onClearCart}
          disabled={cartStatus === 'updating'}
          className="text-sm text-charcoal-light hover:text-red-600 disabled:opacity-60"
        >
          Clear all
        </button>
      </div>

      {cartStatus === 'error' && (
        <p className="mb-4 text-sm text-red-600">Unable to update your cart.</p>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <ul className="divide-y divide-border border-y border-border">
            {cart.lineItems.map((item) => (
              <li
                key={item.id}
                className="py-6 flex gap-4"
              >
                <div className="w-20 h-20 bg-cream-dark rounded-sm shrink-0 overflow-hidden relative">
                  {item.variant.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.variant.images[0].url}
                      alt={item.name[locale] ?? ''}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">
                    {item.name[locale] ?? Object.values(item.name)[0]}
                  </p>
                  <p className="text-sm text-charcoal-light mt-1">
                    {formatMoney(
                      item.price.value.centAmount,
                      item.price.value.currencyCode,
                      locale,
                    )}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    {editingItemId === item.id ? (
                      <>
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(Math.max(1, Number(e.target.value)))
                          }
                          className="w-16 rounded-sm border border-border px-2 py-1 text-sm text-center"
                        />
                        <button
                          type="button"
                          onClick={() => onSaveQuantity(item.id)}
                          disabled={cartStatus === 'updating'}
                          className="text-sm text-terra hover:underline disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="text-sm text-charcoal-light hover:text-charcoal"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-charcoal-light">
                          Qty: {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setQuantity(item.quantity);
                            setCartStatus('idle');
                          }}
                          className="text-sm text-terra hover:underline"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <p className="font-medium">
                    {formatMoney(
                      item.totalPrice.centAmount,
                      item.totalPrice.currencyCode,
                      locale,
                    )}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-charcoal-light hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form
            onSubmit={onApplyCode}
            className="mt-6 flex gap-3"
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Discount code"
              className="flex-1 border border-border rounded-sm px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="border border-border rounded-sm px-4 py-2 text-sm hover:border-charcoal"
            >
              Apply
            </button>
          </form>
          {codeStatus === 'error' && (
            <p className="text-sm text-red-600 mt-2">Invalid discount code.</p>
          )}
        </div>

        <aside className="rounded-sm border border-border bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-light">Subtotal</dt>
              <dd>{formatMoney(subtotal, currency, locale)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-light">Tax</dt>
              <dd>
                {tax === null
                  ? 'Calculated at checkout'
                  : formatMoney(tax, currency, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-light">Discount</dt>
              <dd>
                {discount > 0
                  ? `−${formatMoney(discount, currency, locale)}`
                  : formatMoney(0, currency, locale)}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex justify-between gap-4 border-t border-border pt-5 font-semibold">
            <span>Total</span>
            <span>
              {formatMoney(cart.totalPrice.centAmount, currency, locale)}
            </span>
          </div>
          <Link
            href="/checkout"
            locale={locale}
            className="mt-6 block rounded-sm bg-charcoal py-3 text-center text-sm text-white hover:bg-charcoal-light"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
      <RecentlyViewedProducts locale={locale} />
    </div>
  );
}
