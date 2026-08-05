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
        <p className="text-charcoal-light text-sm">You haven&apos;t placed any orders yet.</p>
      )}
      <ul className="divide-y divide-border">
        {data?.results.map((order) => (
          <li key={order.id} className="py-4 flex justify-between text-sm">
            <div>
              <p className="font-medium">{order.orderNumber ?? order.id}</p>
              <p className="text-charcoal-light">{new Date(order.createdAt).toLocaleDateString(locale)}</p>
            </div>
            <p className="font-medium">{formatMoney(order.totalPrice.centAmount, order.totalPrice.currencyCode, locale)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
