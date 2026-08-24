'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Message } from '@commercetools/checkout-browser-sdk';
import { useCart } from '@/hooks/useCart';

function errorDetail(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  for (const key of ['message', 'error', 'data']) {
    const detail = errorDetail(record[key]);
    if (detail) return detail;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function checkoutErrorMessage(message: Message): string {
  const detail = errorDetail(message.payload);
  const error = detail ? `${message.code}: ${detail}` : message.code || 'Payment error';
  return message.correlationId ? `${error} (correlation ID: ${message.correlationId})` : error;
}

export default function CheckoutPage() {
  const { locale } = useParams<{ locale: string }>();
  const { cart, isLoading, completeCheckout } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const completed = useRef(false);

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
        const { sessionId, projectKey, region, profileContact } = (await res.json()) as {
          sessionId: string;
          projectKey: string;
          region: string;
          profileContact?: { firstName?: string; lastName?: string; email?: string; phone?: string };
        };

        const { checkoutFlow } = await import('@commercetools/checkout-browser-sdk');
        checkoutFlow({
          projectKey,
          region,
          sessionId,
          locale: locale.split('-')[0],
          logInfo: process.env.NODE_ENV !== 'production',
          logWarn: true,
          logError: true,
          forms: {
            default: {
              address: {
                fields: {
                  firstName: {
                    initialValue: profileContact?.firstName,
                    validation: { required: { value: true } },
                  },
                  lastName: {
                    initialValue: profileContact?.lastName,
                    validation: { required: { value: true } },
                  },
                  email: {
                    initialValue: profileContact?.email,
                    validation: { required: { value: true } },
                  },
                  phone: {
                    initialValue: profileContact?.phone,
                    validation: { required: { value: false } },
                  },
                  state: { validation: { required: { value: true } } },
                },
              },
            },
          },
          onInfo: (message: Message) => {
            if (message.code === 'checkout_completed' && !completed.current) {
              completed.current = true;
              void completeCheckout(cart.id)
                .then(() => router.push(`/${locale}/checkout/confirmation`))
                .catch((err) => {
                  completed.current = false;
                  setError(err instanceof Error ? err.message : 'Failed to clear completed cart');
                });
            }
          },
          onError: (message: Message) => {
            setError(checkoutErrorMessage(message));
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
  }, [isLoading, cart, locale, router, completeCheckout]);

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
