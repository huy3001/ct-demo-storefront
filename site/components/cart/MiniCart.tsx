'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import { formatMoney, getLocalizedString } from '@/lib/utils';

export default function MiniCart({ locale }: { locale: string }) {
  const { cart, itemCount, isLoading, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  async function onRemove(lineItemId: string) {
    setRemovingItemId(lineItemId);
    setError(null);
    try {
      await removeItem(lineItemId);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove this item.');
    } finally {
      setRemovingItemId(null);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex hover:text-terra"
        aria-label={`Cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        aria-expanded={isOpen}
        aria-controls="mini-cart-popover"
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 11-1 9" />
            <path d="m19 11-4-7" />
            <path d="M2 11h20" />
            <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
            <path d="M4.5 15.5h15" />
            <path d="m5 11 4-7" />
            <path d="m9 11 1 9" />
          </svg>
        </span>
        {itemCount > 0 && (
          <span className="absolute -top-2.5 left-2.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terra px-1 text-xs text-white">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="mini-cart-popover"
          role="dialog"
          aria-label="Shopping cart"
          className="absolute right-0 top-[calc(100%+1rem)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-sm border border-border bg-white text-charcoal shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold">Your cart</h2>
              <p className="mt-0.5 text-xs text-charcoal-light">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-charcoal-light hover:bg-cream-dark hover:text-charcoal"
              aria-label="Close cart"
            >
              ×
            </button>
          </div>

          {isLoading ? (
            <p className="px-5 py-10 text-center text-sm text-charcoal-light">Loading cart…</p>
          ) : !cart || cart.lineItems.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-medium">Your cart is empty</p>
              <Link
                href="/category/all"
                locale={locale}
                onClick={() => setIsOpen(false)}
                className="mt-3 inline-block text-sm text-terra hover:underline"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="max-h-[min(25rem,55vh)] divide-y divide-border overflow-y-auto px-5">
                {cart.lineItems.map((item) => {
                  const image = item.variant.images?.[0]?.url;
                  const name = getLocalizedString(item.name, locale);
                  return (
                    <li key={item.id} className="flex gap-3 py-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                        {image ? (
                          <Image src={image} alt={name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xs text-charcoal-light">No image</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="mt-1 text-xs text-charcoal-light">Quantity: {item.quantity}</p>
                        <p className="mt-1 text-sm">
                          {formatMoney(item.price.value.centAmount, item.price.value.currencyCode, locale)} each
                        </p>
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          disabled={removingItemId === item.id}
                          className="cursor-pointer mt-2 text-xs text-charcoal-light underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
                        >
                          {removingItemId === item.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                      <p className="shrink-0 text-sm font-medium">
                        {formatMoney(item.totalPrice.centAmount, item.totalPrice.currencyCode, locale)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {error && <p role="alert" className="px-5 pb-3 text-xs text-red-600">{error}</p>}

              <div className="border-t border-border bg-cream px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-charcoal-light">Shipping and taxes calculated at checkout.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    locale={locale}
                    onClick={() => setIsOpen(false)}
                    className="rounded-sm border border-charcoal px-3 py-2.5 text-center text-sm font-medium hover:bg-charcoal hover:text-white"
                  >
                    View cart
                  </Link>
                  <Link
                    href="/checkout"
                    locale={locale}
                    onClick={() => setIsOpen(false)}
                    className="rounded-sm bg-charcoal px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-terra"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
