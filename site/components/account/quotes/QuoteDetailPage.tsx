'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { Link } from '@/i18n/routing';
import Table from '@/components/ui/organisms/table';
import { formatMoney } from '@/lib/utils';
import { isQuote, type Quote } from '@/types/quote';
import QuoteStatusBadge from './QuoteStatusBadge';
import Skeleton from '@/components/ui/atoms/skeleton';

export default function QuoteDetailPage() {
  const translate = useTranslations();
  const { locale, quoteId } = useParams<{ locale: string; quoteId: string }>();
  const [result, setResult] = useState<{
    quoteId: string;
    quote: Quote | null;
    hasError: boolean;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuote() {
      try {
        const response = await fetch(
          `/api/account/quotes/${encodeURIComponent(quoteId)}?locale=${encodeURIComponent(locale)}`,
          { signal: controller.signal },
        );
        if (response.status === 404) {
          setResult({ quoteId, quote: null, hasError: false });
          return;
        }
        if (!response.ok)
          throw new Error(translate('quotes.error.failed-to-load'));
        const data: unknown = await response.json();
        if (!isQuote(data))
          throw new Error(translate('quotes.error.invalid-response'));
        const quote = data;
        setResult({ quoteId, quote, hasError: false });
      } catch {
        if (!controller.signal.aborted) {
          setResult({ quoteId, quote: null, hasError: true });
        }
      }
    }

    void loadQuote();
    return () => controller.abort();
  }, [locale, quoteId, translate]);

  if (!result || result.quoteId !== quoteId) {
    return <Skeleton className="h-5 w-full" />;
  }

  if (result.hasError) {
    return (
      <div>
        <p
          role="alert"
          className="text-sm text-red-700"
        >
          {translate('error.wentWrong')}
        </p>
        <Link
          href="/account/quotes"
          locale={locale}
          className="mt-4 inline-block text-sm text-terra hover:underline"
        >
          {translate('quotes.back')}
        </Link>
      </div>
    );
  }

  const quote = result.quote;

  if (!quote) {
    return (
      <div>
        <h1 className="text-xl font-semibold">{translate('quotes.not-found')}</h1>
        <Link
          href="/account/quotes"
          locale={locale}
          className="mt-4 inline-block text-sm text-terra hover:underline"
        >
          {translate('quotes.back')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-semibold">
          {translate('quotes.details-title')}
        </h1>
        <Link
          href="/account/quotes"
          locale={locale}
          className="text-sm text-terra hover:underline"
        >
          {translate('quotes.back')}
        </Link>
      </div>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.quote-request-id')}
            </dt>
            <dd className="mt-1 text-sm text-charcoal-light">{quote.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.last-modified')}
            </dt>
            <dd className="mt-1 text-sm text-charcoal-light">
              {new Date(quote.lastModifiedAt).toLocaleDateString(locale)}
            </dd>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.creation-date')}
            </dt>
            <dd className="mt-1 text-sm text-charcoal-light">
              {new Date(quote.createdAt).toLocaleDateString(locale)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.status')}
            </dt>
            <dd className="mt-1">
              <QuoteStatusBadge status={quote.status} />
            </dd>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.po-number')}
            </dt>
            <dd className="mt-1 text-sm text-charcoal-light">
              {quote.poNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.owner')}
            </dt>
            <dd className="mt-1 text-sm text-charcoal-light">{quote.owner}</dd>
          </div>
        </div>
      </dl>

      <section className="mt-8 pt-8 border-t border-border">
        <h2 className="mb-4 text-lg font-semibold">
          {translate('quotes.activity')}
        </h2>
        <div className="pl-2">
          <ol className="relative space-y-8 border-l border-border pl-6">
            {quote.activity.map((item) => (
              <li
                key={item.id}
                className="relative"
              >
                <span className="absolute -left-9 -top-0.5 size-6 rounded-full bg-terra border-4 border-(--background)" />
                <p className="text-sm text-charcoal">{item.label}</p>
              </li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-terra hover:underline"
        >
          {translate('quotes.revoke')}
        </button>
      </section>

      <section className="mt-8 pt-8 border-t border-border">
        <h2 className="mb-4 text-lg font-semibold">
          {translate('quotes.items-quoted', { count: quote.items.length })}
        </h2>
        
        <Table>
          <Table.Container>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>
                  {translate('quotes.product')}
                </Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.sku')}</Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.qty')}</Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.price')}</Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.total')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {quote.items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="size-12 rounded-sm object-cover"
                        />
                      ) : null}
                      <span>{item.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.sku')}>
                    <span>{item.sku}</span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.qty')}>
                    <span>{item.quantity}</span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.price')}>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          item.originalPriceCentAmount
                            ? 'font-medium text-red-500'
                            : ''
                        }
                      >
                        {formatMoney(
                          item.priceCentAmount,
                          item.currencyCode,
                          locale,
                        )}
                      </span>
                      {item.originalPriceCentAmount ? (
                        <span className="text-xs text-charcoal-light line-through">
                          {formatMoney(
                            item.originalPriceCentAmount,
                            item.currencyCode,
                            locale,
                          )}
                        </span>
                      ) : null}
                    </div>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.total')}>
                    <span>
                      {formatMoney(
                        item.totalCentAmount,
                        item.currencyCode,
                        locale,
                      )}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Container>
        </Table>
      </section>

      <dl className="border-t border-border w-full pt-4 grid grid-cols-2 gap-y-3 text-sm lg:border-t-0 lg:max-w-sm lg:ml-auto lg:mt-6 lg:pt-0">
        <dt className="text-charcoal-light">{translate('quotes.subtotal')}</dt>
        <dd className="text-right">
          {formatMoney(quote.subtotalCentAmount, quote.currencyCode, locale)}
        </dd>
        <dt className="text-charcoal-light">{translate('quotes.discount')}</dt>
        <dd className="text-right">
          {formatMoney(quote.discountCentAmount, quote.currencyCode, locale)}
        </dd>
        <dt className="text-charcoal-light">{translate('quotes.tax')}</dt>
        <dd className="text-right">
          {formatMoney(quote.taxCentAmount, quote.currencyCode, locale)}
        </dd>
        <dt className="border-t border-border pt-3 font-semibold text-base">
          {translate('quotes.total')}
        </dt>
        <dd className="border-t border-border pt-3 text-right font-semibold text-base">
          {formatMoney(quote.totalCentAmount, quote.currencyCode, locale)}
        </dd>
      </dl>
    </div>
  );
}
