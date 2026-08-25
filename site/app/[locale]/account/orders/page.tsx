'use client';

import useSWR from 'swr';
import type { Order } from '@commercetools/platform-sdk';
import { useParams } from 'next/navigation';
import { formatMoney } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data, isLoading } = useSWR<{ results: Order[] }>('/api/account/orders', fetcher);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Orders</h1>
      {isLoading && <p className="text-charcoal-light text-sm">Loading…</p>}
      {!isLoading && (data?.results.length ?? 0) === 0 && (
        <p className="text-charcoal-light text-sm">
          You haven&apos;t placed any orders yet.
        </p>
      )}
      {data?.results && data?.results.length > 0 && (
        <ul className="divide-y divide-border">
          <li className="py-4 hidden lg:grid lg:grid-cols-5 font-semibold text-xs text-charcoal-light">
            <div className="lg:col-span-2">ORDER NUMBER</div>
            <div className="text-right">DATE</div>
            <div className="text-right">STATUS</div>
            <div className="text-right">TOTAL</div>
          </li>
          {data?.results.map((order) => (
            <li
              key={order.id}
              className="py-4 grid grid-cols-1 lg:grid-cols-5 text-sm"
            >
              <div className="flex gap-1 items-center lg:col-span-2">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  ORDER NUMBER
                </span>
                <p>{order.orderNumber ?? order.id}</p>
              </div>
              <div className="flex gap-1 items-center lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  DATE
                </span>
                <p>{new Date(order.createdAt).toLocaleDateString(locale)}</p>
              </div>
              <div className="flex gap-1 items-center lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  STATUS
                </span>
                <p>{order.orderState}</p>
              </div>
              <div className="flex gap-1 items-center lg:justify-end">
                <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
                  TOTAL
                </span>
                <p>
                  {formatMoney(
                    order.totalPrice.centAmount,
                    order.totalPrice.currencyCode,
                    locale,
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
