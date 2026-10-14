'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { formatMoney } from '@/lib/utils';
import { isQuote, type Quote } from '@/types/quote';
import { classnames } from '@/helpers/utils/classnames';
import Button from '@/components/ui/atoms/button';
import TextArea from '@/components/ui/atoms/text-area';
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
            <TextArea
              name="quote-comment"
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
          <div className="border-b border-border">
            {quote.items.map((item, index) => (
              <div
                key={item.id}
                className={classnames(
                  'flex justify-between items-center py-4',
                  {
                    'border-b border-neutral-400':
                      quote.items && index !== quote.items.length - 1,
                  },
                )}
              >
                <div className="flex items-center justify-start">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="size-20 object-contain shrink-0"
                    />
                  )}
                  <div className="flex flex-col justify-center gap-2 pl-4">
                    <p className="text-sm font-semibold text-gray-700">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatMoney(
                        item.totalCentAmount,
                        item.currencyCode,
                        locale,
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      {item.sku} x {item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between gap-2 text-gray-600">
                <dt>{translate('quotes.subtotal')}</dt>
                <dd>
                  {formatMoney(
                    quote.subtotalCentAmount,
                    quote.currencyCode,
                    locale,
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-2 text-gray-600">
                <dt>{translate('quotes.tax')}</dt>
                <dd>
                  {formatMoney(quote.taxCentAmount, quote.currencyCode, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-2 text-gray-600">
                <dt>{translate('quotes.discount')}</dt>
                <dd>
                  {formatMoney(
                    quote.discountCentAmount,
                    quote.currencyCode,
                    locale,
                  )}
                </dd>
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <dt>{translate('quotes.total')}</dt>
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
