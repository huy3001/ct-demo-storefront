'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';

export default function CartPage() {
  const { locale } = useParams<{ locale: string }>();
  const { cart, isLoading, changeQuantity, removeItem, applyDiscountCode } = useCart();
  const [code, setCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-charcoal-light">Loading cart…</div>;
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold mb-4">Your cart is empty</h1>
        <Link href="/category/all" locale={locale} className="text-terra hover:underline">
          Continue shopping
        </Link>
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-8">Your cart</h1>

      <ul className="divide-y divide-border">
        {cart.lineItems.map((item) => (
          <li key={item.id} className="py-6 flex gap-4">
            <div className="w-20 h-20 bg-cream-dark rounded-sm shrink-0 overflow-hidden relative">
              {item.variant.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.variant.images[0].url} alt={item.name[locale] ?? ''} className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-charcoal">{item.name[locale] ?? Object.values(item.name)[0]}</p>
              <p className="text-sm text-charcoal-light mt-1">
                {formatMoney(item.price.value.centAmount, item.price.value.currencyCode, locale)}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => changeQuantity(item.id, Math.max(1, Number(e.target.value)))}
                  className="w-16 border border-border rounded-sm px-2 py-1 text-sm"
                />
                <button onClick={() => removeItem(item.id)} className="text-sm text-charcoal-light hover:text-red-600">
                  Remove
                </button>
              </div>
            </div>
            <p className="font-medium">
              {formatMoney(item.totalPrice.centAmount, item.totalPrice.currencyCode, locale)}
            </p>
          </li>
        ))}
      </ul>

      <form onSubmit={onApplyCode} className="mt-8 flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Discount code"
          className="flex-1 border border-border rounded-sm px-3 py-2 text-sm"
        />
        <button type="submit" className="border border-border rounded-sm px-4 py-2 text-sm hover:border-charcoal">
          Apply
        </button>
      </form>
      {codeStatus === 'error' && <p className="text-sm text-red-600 mt-2">Invalid discount code.</p>}

      <div className="mt-10 border-t border-border pt-6 flex justify-between items-center">
        <span className="text-lg font-semibold">Subtotal</span>
        <span className="text-lg font-semibold">
          {formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}
        </span>
      </div>

      <Link
        href="/checkout"
        locale={locale}
        className="mt-6 block text-center bg-charcoal text-white py-3 rounded-sm text-sm hover:bg-charcoal-light"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
