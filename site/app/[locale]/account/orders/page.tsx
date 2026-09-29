'use client';

import useSWR from 'swr';
import type { Order } from '@commercetools/platform-sdk';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'use-intl';
import { formatMoney } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';

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

      {isLoading && (
        <p className="text-charcoal-light text-sm">
          {translate('common.loading')}
        </p>
      )}

      {!isLoading && (data?.results.length ?? 0) === 0 && (
        <p className="text-charcoal-light text-sm">
          {translate('orders.have-not-placed-orders')}
        </p>
      )}

      {data?.results && data?.results.length > 0 && (
        <ul className="divide-y divide-border">
          <li className="py-4 hidden lg:grid lg:grid-cols-7 font-semibold text-xs text-charcoal-light uppercase">
            <div className="lg:col-span-2">
              {translate('orders.order-number')}
            </div>
            <div className="text-right">{translate('orders.order-date')}</div>
            <div className="text-right">{translate('orders.status')}</div>
            <div className="text-right">{translate('orders.total')}</div>
            <div className="text-right lg:col-span-2">
              {translate('orders.action')}
            </div>
          </li>
          {data?.results.map((order) => (
            <li
              key={order.id}
              className="py-4 grid grid-cols-1 lg:grid-cols-7 text-sm gap-y-2"
            >
              <div className="flex gap-1 items-center lg:col-span-2">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  {translate('orders.order-number')}
                </span>
                <p>{order.orderNumber ?? order.id}</p>
              </div>
              <div className="flex gap-1 items-center lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  {translate('orders.order-date')}
                </span>
                <p>{new Date(order.createdAt).toLocaleDateString(locale)}</p>
              </div>
              <div className="flex gap-1 items-center lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  {translate('orders.status')}
                </span>
                <p>{order.orderState}</p>
              </div>
              <div className="flex gap-1 items-center lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  {translate('orders.total')}
                </span>
                <p>
                  {formatMoney(
                    order.totalPrice.centAmount,
                    order.totalPrice.currencyCode,
                    locale,
                  )}
                </p>
              </div>
              <div className="flex gap-1 items-center lg:col-span-2 lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  {translate('orders.action')}
                </span>
                <div className="flex gap-2 items-center">
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
              </div>
              {messages[order.id]?.length > 0 && (
                <div
                  className="lg:col-span-6 mt-2 rounded bg-cream-dark px-3 py-2"
                  role="status"
                >
                  {messages[order.id].map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
