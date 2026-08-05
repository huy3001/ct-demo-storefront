'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

export default function CheckoutPage() {
  const { locale } = useParams<{ locale: string }>();
  const { cart, isLoading } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (isLoading || !cart || cart.lineItems.length === 0) return;
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const res = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? 'Failed to start checkout');
        }
        const { sessionId, projectKey, region } = await res.json();

        const { checkoutFlow } = await import('@commercetools/checkout-browser-sdk');
        checkoutFlow({
          projectKey,
          region,
          sessionId,
          locale: locale.split('-')[0],
          logInfo: process.env.NODE_ENV !== 'production',
          logWarn: true,
          logError: true,
          onInfo: (message: { code: string }) => {
            if (message.code === 'checkout_completed') {
              router.push(`/${locale}/checkout/confirmation`);
            }
          },
          onError: (err: { payload?: unknown; code?: string }) => {
            setError(String(err.payload ?? err.code ?? 'Payment error'));
          },
          styles: {
            '--font-family': 'var(--font-sans)',
            '--color-primary': '#1a1a1a',
            '--color-primary-hover': '#4a4a4a',
            '--border-radius': '0.125rem',
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start checkout');
      }
    })();
  }, [isLoading, cart, locale, router]);

  if (!isLoading && (!cart || cart.lineItems.length === 0)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-charcoal-light">
        Your cart is empty. Add items before checking out.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}
      {/* Required mount point for the Checkout Browser SDK — without it the widget
          mounts at the document root and takes over the full page. */}
      <div data-ctc />
    </div>
  );
}
