'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { Customer } from '@commercetools/platform-sdk';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AddressesPage() {
  const { data: customer, mutate } = useSWR<Customer>('/api/account', fetcher);
  const [form, setForm] = useState({ country: 'US', city: '', streetName: '', postalCode: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      await mutate(updated, { revalidate: false });
      setForm({ country: 'US', city: '', streetName: '', postalCode: '' });
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  async function onRemove(addressId: string) {
    const res = await fetch('/api/account/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId }),
    });
    if (res.ok) {
      const updated = await res.json();
      await mutate(updated, { revalidate: false });
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Addresses</h1>

      <ul className="space-y-3 mb-8">
        {customer?.addresses?.map((address) => (
          <li key={address.id} className="border border-border rounded-sm p-4 flex justify-between text-sm">
            <div>
              <p>{address.streetName}</p>
              <p className="text-charcoal-light">
                {address.city}, {address.postalCode}, {address.country}
              </p>
            </div>
            <button onClick={() => address.id && onRemove(address.id)} className="text-charcoal-light hover:text-red-600">
              Remove
            </button>
          </li>
        ))}
        {(customer?.addresses?.length ?? 0) === 0 && (
          <p className="text-charcoal-light text-sm">No saved addresses yet.</p>
        )}
      </ul>

      <form onSubmit={onAdd} className="space-y-4 max-w-sm">
        <input
          placeholder="Street"
          value={form.streetName}
          onChange={(e) => setForm((f) => ({ ...f, streetName: e.target.value }))}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm"
        />
        <div className="flex gap-3">
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-1/2 border border-border rounded-sm px-3 py-2 text-sm"
          />
          <input
            placeholder="Postal code"
            value={form.postalCode}
            onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            className="w-1/2 border border-border rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <input
          placeholder="Country (ISO code, e.g. US)"
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-charcoal text-white px-5 py-2 rounded-sm text-sm hover:bg-charcoal-light">
          Add address
        </button>
        {status === 'error' && <p className="text-sm text-red-600">Something went wrong.</p>}
      </form>
    </div>
  );
}
