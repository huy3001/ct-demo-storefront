'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Customer } from '@commercetools/platform-sdk';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AddressesPage() {
  const { data: customer, mutate } = useSWR<Customer>('/api/account', fetcher);
  const { locale } = useParams<{ locale: string }>();
  const [status, setStatus] = useState<'idle' | 'error'>('idle');

  async function onRemove(addressId: string) {
    setStatus('idle');
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      await mutate(updated, { revalidate: false });
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Addresses</h1>
        <Link href="/account/addresses/new" locale={locale} className="rounded-sm bg-charcoal px-4 py-2 text-sm text-white hover:bg-charcoal-light">Add new address</Link>
      </div>

      <ul className="space-y-3 mb-8">
        {customer?.addresses?.map((address) => (
          <li key={address.id} className="border border-border rounded-sm p-4 flex justify-between text-sm">
            <div>
              <p>{address.streetName}</p>
              <p className="text-charcoal-light">
                {address.city}, {address.postalCode}, {address.country}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {address.id && <Link href={`/account/addresses/${address.id}/edit`} locale={locale} className="text-terra hover:underline">Edit</Link>}
              <button onClick={() => address.id && onRemove(address.id)} className="text-charcoal-light hover:text-red-600">Remove</button>
            </div>
          </li>
        ))}
        {(customer?.addresses?.length ?? 0) === 0 && (
          <p className="text-charcoal-light text-sm">No saved addresses yet.</p>
        )}
      </ul>

      {status === 'error' && <p className="text-sm text-red-600">Could not remove the address.</p>}
    </div>
  );
}
