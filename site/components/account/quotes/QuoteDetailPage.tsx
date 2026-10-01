'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { Link } from '@/i18n/routing';
import Table from '@/components/ui/organisms/table';
import { formatMoney } from '@/lib/utils';
import { getQuoteById } from '@/lib/quotes/mock-data';
import QuoteStatusBadge from './QuoteStatusBadge';

export default function QuoteDetailPage() {
  const translate = useTranslations();
  const { locale, quoteId } = useParams<{ locale: string; quoteId: string }>();
  const quote = getQuoteById(quoteId);

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
        <h1 className="text-xl font-semibold">{translate('quotes.details-title')}</h1>
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
            <dd className="mt-1 text-sm text-charcoal-light">{quote.poNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-charcoal">
              {translate('quotes.owner')}
            </dt>
            <dd className="mt-1 text-sm text-charcoal-light">{quote.owner}</dd>
          </div>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">{translate('quotes.activity')}</h2>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {quote.activity.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute left-[-1.55rem] top-1.5 size-2.5 rounded-full bg-terra" />
              <p className="text-sm text-charcoal">{item.label}</p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-terra hover:underline"
        >
          {translate('quotes.revoke')}
        </button>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">
          {translate('quotes.items-quoted', { count: quote.items.length })}
        </h2>
        <Table>
          <Table.Container>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{translate('quotes.product')}</Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.sku')}</Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.qty')}</Table.HeaderCell>
                <Table.HeaderCell>{translate('quotes.price')}</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  {translate('quotes.total')}
                </Table.HeaderCell>
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
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 rounded object-cover"
                        />
                      ) : null}
                      <span>{item.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{item.sku}</Table.Cell>
                  <Table.Cell>{item.quantity}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-0.5">
                      {item.originalPriceCentAmount ? (
                        <span className="text-12 text-charcoal-light line-through">
                          {formatMoney(
                            item.originalPriceCentAmount,
                            item.currencyCode,
                            locale,
                          )}
                        </span>
                      ) : null}
                      <span className="font-medium">
                        {formatMoney(
                          item.priceCentAmount,
                          item.currencyCode,
                          locale,
                        )}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {formatMoney(
                      item.totalCentAmount,
                      item.currencyCode,
                      locale,
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Container>
        </Table>
      </section>
    </div>
  );
}
