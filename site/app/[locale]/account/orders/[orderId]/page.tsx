'use client';

import useSWR from 'swr';
import type { Address, Order, Payment } from '@commercetools/platform-sdk';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { formatMoney } from '@/lib/utils';
import Skeleton from '@/components/ui/atoms/skeleton';
import Table from '@/components/ui/organisms/table';

async function fetcher(url: string): Promise<Order> {
  const response = await fetch(url);
  const body = (await response.json()) as Order & { message?: string };
  if (!response.ok) throw new Error(body.message ?? 'Unable to load order');
  return body;
}

function localizedName(values: Record<string, string>, locale: string): string {
  return values[locale] ?? Object.values(values)[0] ?? 'Item';
}

function AddressBlock({ address }: { address?: Address }) {
  const translate = useTranslations();
  if (!address)
    return (
      <p className="text-sm text-charcoal-light">
        {translate('orders.not-provided')}
      </p>
    );
  const fullName = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(' ');
  const cityLine = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(', ');
  return (
    <address className="text-sm leading-6 not-italic text-charcoal-light">
      {fullName && <div>{fullName}</div>}
      {address.company && <div>{address.company}</div>}
      {address.streetName && (
        <div>
          {address.streetNumber} {address.streetName}
        </div>
      )}
      {address.additionalStreetInfo && (
        <div>{address.additionalStreetInfo}</div>
      )}
      {cityLine && <div>{cityLine}</div>}
      <div>{address.country}</div>
      {address.phone && <div>{address.phone}</div>}
    </address>
  );
}

function paymentMethod(order: Order, locale: string, message: string): string {
  const payment = order.paymentInfo?.payments[0]?.obj as Payment | undefined;
  const info = payment?.paymentMethodInfo;
  return info?.name
    ? localizedName(info.name, locale)
    : (info?.method ?? info?.paymentInterface ?? message);
}

export default function OrderDetailPage() {
  const translate = useTranslations();
  const { locale, orderId } = useParams<{ locale: string; orderId: string }>();
  const {
    data: order,
    error,
    isLoading,
  } = useSWR<Order>(`/api/account/orders/${orderId}`, fetcher);

  if (isLoading)
    return <Skeleton className="h-5 w-full" />;
  
  if (error || !order) {
    return (
      <div>
        <h1 className="text-xl font-semibold">
          {translate('orders.order-not-found')}
        </h1>
        <p className="mt-2 text-charcoal-light">{error?.message}</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/account/orders"
        locale={locale}
        className="text-sm text-terra hover:underline"
      >
        ← {translate('orders.back')}
      </Link>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {order.orderNumber ?? translate('thank-you.order-details')}
          </h1>
          <p className="mt-1 text-sm text-charcoal-light">
            <span className="font-semibold">
              {translate('orders.order-id')}:{' '}
            </span>
            {order.id}
          </p>
        </div>
        <div className="text-sm sm:text-right">
          <p>
            <span className="font-semibold">
              {translate('orders.status')}:{' '}
            </span>
            {order.orderState}
          </p>
          <p>
            <span className="font-semibold">
              {translate('orders.created')}:{' '}
            </span>
            {new Date(order.createdAt).toLocaleDateString(locale)}
          </p>
        </div>
      </div>

      <section className="mt-8 pt-8 border-t border-border">
        <h2 className="text-lg font-semibold mb-4">
          {translate('product.products')}
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
              {order.lineItems.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {item.variant.images?.[0] && (
                        <Image
                          src={item.variant.images[0].url}
                          alt={localizedName(item.name, locale)}
                          width={48}
                          height={48}
                          className="size-12 rounded-sm object-cover"
                        />
                      )}
                      <span>{localizedName(item.name, locale)}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.sku')}>
                    <span>{item.variant.sku}</span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.qty')}>
                    <span>{item.quantity}</span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.price')}>
                    <span>
                      {formatMoney(
                        item.totalPrice.centAmount,
                        item.totalPrice.currencyCode,
                        locale,
                      )}
                    </span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.total')}>
                    <span>
                      {formatMoney(
                        item.totalPrice.centAmount,
                        item.totalPrice.currencyCode,
                        locale,
                      )}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Container>
        </Table>

        <dl className="border-t border-border w-full pt-4 grid grid-cols-2 gap-y-3 text-sm lg:border-t-0 lg:max-w-sm lg:ml-auto lg:mt-6 lg:pt-0">
          <dt className="text-charcoal-light">
            {translate('quotes.subtotal')}
          </dt>
          <dd className="text-right">
            {formatMoney(
              order?.taxedPrice?.totalNet?.centAmount ?? 0,
              order?.taxedPrice?.totalNet?.currencyCode ?? 'USD',
              locale,
            )}
          </dd>
          {/* <dt className="text-charcoal-light">
            {translate('quotes.discount')}
          </dt>
          <dd className="text-right">
            {formatMoney(order.discountCentAmount, order.currencyCode, locale)}
          </dd> */}
          <dt className="text-charcoal-light">{translate('quotes.tax')}</dt>
          <dd className="text-right">
            {formatMoney(
              order?.taxedPrice?.totalTax?.centAmount ?? 0,
              order?.taxedPrice?.totalTax?.currencyCode ?? 'USD',
              locale,
            )}
          </dd>
          <dt className="font-semibold text-base">
            {translate('quotes.total')}
          </dt>
          <dd className="text-right font-semibold text-base">
            {formatMoney(
              order?.taxedPrice?.totalGross?.centAmount ?? 0,
              order?.taxedPrice?.totalGross?.currencyCode ?? 'USD',
              locale,
            )}
          </dd>
        </dl>
      </section>

      <section className="mt-8 pt-8 border-t border-border grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-10">
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {translate('checkout.shippingAddress')}
          </h2>
          <AddressBlock address={order.shippingAddress} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {translate('checkout.billingAddress')}
          </h2>
          <AddressBlock address={order.billingAddress} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {translate('orders.shipping-method')}
          </h2>
          <p className="text-sm text-charcoal-light">
            {order.shippingInfo?.shippingMethodName ??
              translate('orders.not-provided')}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {translate('checkout.paymentMethod')}
          </h2>
          <p className="text-sm text-charcoal-light">
            {paymentMethod(order, locale, translate('orders.not-provided'))}
          </p>
        </div>
      </section>
    </div>
  );
}
