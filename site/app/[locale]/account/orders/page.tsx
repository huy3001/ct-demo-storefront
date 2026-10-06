'use client';

import useSWR from 'swr';
import type { Order } from '@commercetools/platform-sdk';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslations } from 'use-intl';
import { formatMoney } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import Skeleton from '@/components/ui/atoms/skeleton';
import Table from '@/components/ui/organisms/table';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const translate = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const { data, isLoading } = useSWR<{ results: Order[] }>(
    '/api/account/orders',
    fetcher,
  );
  const { refresh } = useCart();
  const [reorderingId, setReorderingId] = useState<string>();
  const [messages, setMessages] = useState<Record<string, string[]>>({});

  async function reorder(order: Order) {
    setReorderingId(order.id);
    setMessages((current) => ({ ...current, [order.id]: [] }));
    try {
      const response = await fetch(`/api/account/orders/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      const body = (await response.json()) as {
        message?: string;
        addedItemCount?: number;
        notices?: Array<{
          name: string;
          requestedQuantity: number;
          addedQuantity: number;
          reason: 'unavailable' | 'quantity-reduced';
        }>;
      };
      if (!response.ok)
        throw new Error(body.message ?? translate('error.unable-reorder'));

      const nextMessages = [
        body.addedItemCount
          ? `${body.addedItemCount} ${body.addedItemCount === 1 ? translate('cart.item') : translate('product.items')} ${translate('cart.cart-added')}.`
          : translate('cart.cart-no-items-added'),
        ...(body.notices ?? []).map((notice) =>
          notice.reason === 'unavailable'
            ? `${notice.name} ${translate('cart.cart-not-added')}.`
            : `${notice.name}: ${notice.addedQuantity} ${translate('cart.of')} ${notice.requestedQuantity} ${translate('cart.limited-stock')}.`,
        ),
      ];
      setMessages((current) => ({ ...current, [order.id]: nextMessages }));
      await refresh();
    } catch (err) {
      setMessages((current) => ({
        ...current,
        [order.id]: [
          err instanceof Error
            ? err.message
            : translate('error.unable-reorder'),
        ],
      }));
    } finally {
      setReorderingId(undefined);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        {translate('account.orders')}
      </h1>

      {isLoading && <Skeleton className="h-5 w-full" />}

      {!isLoading && (data?.results.length ?? 0) === 0 && (
        <p className="text-charcoal-light text-center text-sm">
          {translate('orders.have-not-placed-orders')}
        </p>
      )}

      {data?.results && data?.results.length > 0 && (
        <Table>
          <Table.Container>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>
                  {translate('orders.order-number')}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {translate('orders.order-date')}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {translate('orders.status')}
                </Table.HeaderCell>
                <Table.HeaderCell>{translate('orders.total')}</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {data?.results.map((order) => (
                <React.Fragment key={order.id}>
                  <Table.Row key={order.id}>
                    <Table.Cell cellHeading={translate('orders.order-number')}>
                      <span>{order.orderNumber ?? order.id}</span>
                    </Table.Cell>
                    <Table.Cell cellHeading={translate('orders.order-date')}>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString(locale)}
                      </span>
                    </Table.Cell>
                    <Table.Cell cellHeading={translate('orders.status')}>
                      <span>{order.orderState}</span>
                    </Table.Cell>
                    <Table.Cell cellHeading={translate('orders.total')}>
                      <span>
                        {formatMoney(
                          order.totalPrice.centAmount,
                          order.totalPrice.currencyCode,
                          locale,
                        )}
                      </span>
                    </Table.Cell>
                    <Table.Cell cellHeading={translate('common.actions')}>
                      <div className="flex gap-2 items-center justify-end">
                        <Link
                          href={`/account/orders/${order.id}`}
                          locale={locale}
                          className="text-terra hover:underline whitespace-nowrap"
                        >
                          {translate('orders.view-order')}
                        </Link>

                        <button
                          type="button"
                          disabled={reorderingId === order.id}
                          onClick={() => reorder(order)}
                          className="text-terra hover:underline whitespace-nowrap disabled:cursor-wait disabled:opacity-60"
                        >
                          {reorderingId === order.id
                            ? translate('orders.adding')
                            : translate('orders.reorder')}
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>

                  {messages[order.id]?.length > 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5}>
                        {messages[order.id].map((message) => (
                          <p key={message}>{message}</p>
                        ))}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </React.Fragment>
              ))}
            </Table.Body>
          </Table.Container>
        </Table>
      )}
    </div>
  );
}
