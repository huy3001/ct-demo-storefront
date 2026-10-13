'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { formatMoney } from '@/lib/utils';
import { isQuote, type Quote } from '@/types/quote';
import Button from '@/components/ui/atoms/button';
import Skeleton from '@/components/ui/atoms/skeleton';

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
  const translate = useTranslations();
  const quoteRequestId = searchParams.get('quoteRequestId');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [commentStatus, setCommentStatus] = useState(translate('quotes.comment-auto-save'));

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
              : translate('quotes.failed-to-load-submitted-quote'),
          );
        }
        setQuote(body);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : translate('quotes.failed-to-load-submitted-quote'),
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadQuote();
    return () => controller.abort();
  }, [locale, quoteRequestId, translate]);

  useEffect(() => {
    if (!quoteRequestId) return;
    const timeout = window.setTimeout(() => {
      try {
        setComment(
          window.localStorage.getItem(`quote-comment-${quoteRequestId}`) ?? '',
        );
      } catch {
        setCommentStatus(translate('quotes.comment-auto-save-unavailable'));
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [quoteRequestId, translate]);

  if (!quoteRequestId) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p
          role="alert"
          className="text-sm text-red-700 mb-6"
        >
          {translate('quotes.quote-request-id-missing')}
        </p>
        <Link
          href="/account/quotes"
          locale={locale}
        >
          <Button variant="secondary">
            {translate('quotes.review-quote-requests')}
          </Button>
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="h-5 w-full" />
      </main>
    );
  }

  if (loadError || !quote) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p
          role="alert"
          className="text-sm text-red-700 mb-6"
        >
          {loadError ??
            (quoteRequestId
              ? translate('quotes.quote-request-not-found')
              : translate('quotes.quote-request-id-missing'))}
        </p>
        <Link
          href="/account/quotes"
          locale={locale}
        >
          <Button variant="secondary">
            {translate('quotes.review-quote-requests')}
          </Button>
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
            {translate('quotes.quote-request-submitted')}
          </h1>
          <p className="mt-2 text-sm text-charcoal-light">
            {translate('quotes.quote-request-submitted-description')}
          </p>
          <dl className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-charcoal-light">
                {translate('quotes.quote-id')}
              </dt>
              <dd className="mt-1 break-all text-sm font-semibold">
                {quote.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-light">
                {translate('quotes.po-number')}
              </dt>
              <dd className="mt-1 text-sm font-semibold">{quote.poNumber}</dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-light">
                {translate('quotes.customer')}
              </dt>
              <dd className="mt-1 text-sm font-semibold">{quote.owner}</dd>
              {quote.customerEmail && (
                <dd className="mt-1 text-sm">{quote.customerEmail}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-charcoal-light">
                {translate('quotes.delivery-method')}
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {quote.shippingMethodName || translate('quotes.not-specified')}
              </dd>
            </div>
          </dl>

          <div className="mt-7 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase">
                {translate('quotes.delivery-address')}
              </h2>
              {deliveryLines.map((line, index) => (
                <p
                  key={`${index}-${line}`}
                  className="text-sm"
                >
                  {line}
                </p>
              ))}
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase">
                {translate('checkout.billingAddress')}
              </h2>
              {billingLines.map((line, index) => (
                <p
                  key={`${index}-${line}`}
                  className="text-sm"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <section className="mt-7 border-t border-border pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase">
              {translate('quotes.comment')}
            </h2>
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
                  setCommentStatus(
                    translate('quotes.comment-saved-automatically'),
                  );
                } catch {
                  setCommentStatus(
                    translate('quotes.comment-save-unavailable'),
                  );
                }
              }}
              rows={4}
              maxLength={2000}
              aria-label={translate('quotes.comment')}
              placeholder={translate('quotes.comment-placeholder')}
              className="w-full resize-y rounded-sm border border-border p-3 text-sm"
            />
            <p
              role="status"
              className="mt-2 text-xs text-charcoal-light"
            >
              {commentStatus}
            </p>
          </section>

          <section className="mt-7 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">
              {translate('account.quotes')}
            </h2>
            <p className="mt-1 mb-5 text-sm text-charcoal-light">
              {translate('quotes.quotes-description')}
            </p>
            <Link
              href="/account/quotes"
              locale={locale}
            >
              <Button>{translate('quotes.review-quote-requests')}</Button>
            </Link>
          </section>
        </section>

        <aside className="rounded-sm bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">
            {translate('quotes.items-quoted', { count: quote.items.length })}
          </h2>
          <div className="mt-4 space-y-4 border-b border-border pb-4">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-3 text-sm"
              >
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
              <dd>
                {formatMoney(
                  quote.subtotalCentAmount,
                  quote.currencyCode,
                  locale,
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Tax</dt>
              <dd>
                {formatMoney(quote.taxCentAmount, quote.currencyCode, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Discount</dt>
              <dd>
                {formatMoney(
                  quote.discountCentAmount,
                  quote.currencyCode,
                  locale,
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <dt>Total</dt>
              <dd>
                {formatMoney(quote.totalCentAmount, quote.currencyCode, locale)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
