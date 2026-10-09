'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { formatMoney } from '@/lib/utils';
import { isQuote, type Quote } from '@/types/quote';

function addressLines(
  address: Quote['deliveryAddress'] | Quote['billingAddress'],
): string[] {
  if (!address) return [];
  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.company,
    [address.streetNumber, address.streetName].filter(Boolean).join(' '),
    address.additionalStreetInfo,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter((value): value is string => Boolean(value));
}

export default function QuoteSubmittedPage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const quoteRequestId = searchParams.get('quoteRequestId');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [commentStatus, setCommentStatus] = useState('Changes are saved automatically.');

  useEffect(() => {
    if (!quoteRequestId) return;
    const controller = new AbortController();
    async function loadQuote() {
      try {
        const response = await fetch(
          `/api/account/quotes/${encodeURIComponent(quoteRequestId!)}?locale=${encodeURIComponent(locale)}`,
          { signal: controller.signal },
        );
        const body: unknown = await response.json();
        if (!response.ok || !isQuote(body)) {
          throw new Error(
            typeof body === 'object' &&
              body !== null &&
              'message' in body &&
              typeof body.message === 'string'
              ? body.message
              : 'Unable to load the submitted quote request.',
          );
        }
        setQuote(body);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load the submitted quote request.',
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadQuote();
    return () => controller.abort();
  }, [locale, quoteRequestId]);

  useEffect(() => {
    if (!quoteRequestId) return;
    const timeout = window.setTimeout(() => {
      try {
        setComment(
          window.localStorage.getItem(`quote-comment-${quoteRequestId}`) ?? '',
        );
      } catch {
        setCommentStatus('Automatic saving is unavailable in this browser.');
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [quoteRequestId]);

  if (!quoteRequestId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p role="alert" className="text-sm text-red-700">
          Quote request ID is missing.
        </p>
        <Link href="/account/quotes" locale={locale} className="mt-5 inline-block underline">
          Review quote requests
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center text-charcoal-light">
        Loading submitted quote…
      </main>
    );
  }

  if (loadError || !quote) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p role="alert" className="text-sm text-red-700">
          {loadError ?? (quoteRequestId ? 'Quote request not found.' : 'Quote request ID is missing.')}
        </p>
        <Link href="/account/quotes" locale={locale} className="mt-5 inline-block underline">
          Review quote requests
        </Link>
      </main>
    );
  }

  const deliveryLines = addressLines(quote.deliveryAddress);
  const billingLines = addressLines(quote.billingAddress);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section className="rounded-sm bg-white p-6 md:p-8">
          <h1 className="text-xl font-semibold">
            Your quote request has been submitted
          </h1>
          <p className="mt-2 text-sm text-charcoal-light">
            A sales representative will review your request and contact you with updates.
          </p>
          <dl className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-charcoal-light">Quote ID</dt>
              <dd className="mt-1 break-all text-sm font-semibold">{quote.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-light">PO Number</dt>
              <dd className="mt-1 text-sm font-semibold">{quote.poNumber}</dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-light">Customer</dt>
              <dd className="mt-1 text-sm font-semibold">{quote.owner}</dd>
              {quote.customerEmail && (
                <dd className="mt-1 text-sm">{quote.customerEmail}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-charcoal-light">Delivery method</dt>
              <dd className="mt-1 text-sm font-semibold">
                {quote.shippingMethodName || 'Not specified'}
              </dd>
            </div>
          </dl>

          <div className="mt-7 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase">Delivery address</h2>
              {deliveryLines.map((line, index) => (
                <p key={`${index}-${line}`} className="text-sm">{line}</p>
              ))}
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase">Billing address</h2>
              {billingLines.map((line, index) => (
                <p key={`${index}-${line}`} className="text-sm">{line}</p>
              ))}
            </div>
          </div>

          <section className="mt-7 border-t border-border pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase">Comment</h2>
            <textarea
              value={comment}
              onChange={(event) => {
                const value = event.target.value;
                setComment(value);
                try {
                  window.localStorage.setItem(
                    `quote-comment-${quote.id}`,
                    value,
                  );
                  setCommentStatus('Saved automatically.');
                } catch {
                  setCommentStatus('Unable to save this comment in this browser.');
                }
              }}
              rows={4}
              maxLength={2000}
              aria-label="Comment"
              placeholder="Add an optional note to your quote request"
              className="w-full resize-y rounded-sm border border-border p-3 text-sm"
            />
            <p role="status" className="mt-2 text-xs text-charcoal-light">
              {commentStatus}
            </p>
          </section>

          <section className="mt-7 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Quotes</h2>
            <p className="mt-1 text-sm text-charcoal-light">
              Manage, review or track your quote requests.
            </p>
            <Link
              href="/account/quotes"
              locale={locale}
              className="mt-5 inline-block rounded-sm bg-charcoal px-6 py-3 text-center text-sm text-white hover:bg-charcoal-light"
            >
              Review quote request
            </Link>
          </section>
        </section>

        <aside className="rounded-sm bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Items quoted</h2>
          <div className="mt-4 space-y-4 border-b border-border pb-4">
            {quote.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <div>
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="mb-2 size-12 rounded-sm object-contain"
                    />
                  )}
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-charcoal-light">
                    {item.sku} · Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0">
                  {formatMoney(item.totalCentAmount, item.currencyCode, locale)}
                </span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt>Subtotal</dt>
              <dd>{formatMoney(quote.subtotalCentAmount, quote.currencyCode, locale)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Tax</dt>
              <dd>{formatMoney(quote.taxCentAmount, quote.currencyCode, locale)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Discount</dt>
              <dd>{formatMoney(quote.discountCentAmount, quote.currencyCode, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(quote.totalCentAmount, quote.currencyCode, locale)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
