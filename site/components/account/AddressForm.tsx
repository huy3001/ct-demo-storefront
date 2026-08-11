'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { BaseAddress } from '@commercetools/platform-sdk';

type AddressFields = Pick<BaseAddress, 'country' | 'city' | 'streetName' | 'postalCode'>;

export default function AddressForm({ addressId, initialAddress }: { addressId?: string; initialAddress?: AddressFields }) {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [form, setForm] = useState<AddressFields>({
    country: initialAddress?.country ?? 'US',
    city: initialAddress?.city ?? '',
    streetName: initialAddress?.streetName ?? '',
    postalCode: initialAddress?.postalCode ?? '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account/addresses', {
        method: addressId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressId ? { addressId, address: form } : form),
      });
      if (!res.ok) throw new Error();
      router.push(`/${locale}/account/addresses`);
      router.refresh();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      <input required placeholder="Street" value={form.streetName} onChange={(e) => setForm((f) => ({ ...f, streetName: e.target.value }))} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
      <div className="flex gap-3">
        <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-1/2 rounded-sm border border-border px-3 py-2 text-sm" />
        <input required placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} className="w-1/2 rounded-sm border border-border px-3 py-2 text-sm" />
      </div>
      <input required minLength={2} maxLength={2} placeholder="Country (ISO code, e.g. US)" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
      <button type="submit" disabled={status === 'saving'} className="rounded-sm bg-charcoal px-5 py-2 text-sm text-white hover:bg-charcoal-light disabled:opacity-60">
        {status === 'saving' ? 'Saving…' : addressId ? 'Save address' : 'Add address'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong.</p>}
    </form>
  );
}
