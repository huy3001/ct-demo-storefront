'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { BaseAddress, Customer } from '@commercetools/platform-sdk';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AddressCard({
  address,
  locale,
  onRemove,
}: {
  address: BaseAddress;
  locale: string;
  onRemove: (addressId: string) => void;
}) {
  return (
    <div className="flex justify-between rounded-sm border border-border p-4 text-sm">
      <div>
        <p>{address.streetName}</p>
        <p className="text-charcoal-light">
          {address.city}, {address.postalCode}, {address.country}
        </p>
      </div>
      {address.id && (
        <div className="flex items-center gap-3">
          <Link href={`/account/addresses/${address.id}/edit`} locale={locale} className="text-terra hover:underline">
            Edit
          </Link>
          <button onClick={() => onRemove(address.id!)} className="text-charcoal-light hover:text-red-600">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function AddressesPage() {
  const { data: customer, mutate } = useSWR<Customer>('/api/account', fetcher);
  const { locale } = useParams<{ locale: string }>();
  const [status, setStatus] = useState<'idle' | 'error'>('idle');
  const addresses = customer?.addresses ?? [];
  const defaultShippingAddress = addresses.find((address) => address.id === customer?.defaultShippingAddressId);
  const defaultBillingAddress = addresses.find((address) => address.id === customer?.defaultBillingAddressId);
  const additionalAddresses = addresses.filter(
    (address) =>
      address.id !== customer?.defaultShippingAddressId &&
      address.id !== customer?.defaultBillingAddressId,
  );

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

      <div className="mb-8 space-y-8">
        <section>
          <h2 className="mb-3 font-medium">Default shipping address</h2>
          {defaultShippingAddress ? (
            <AddressCard address={defaultShippingAddress} locale={locale} onRemove={onRemove} />
          ) : (
            <p className="text-sm text-charcoal-light">No default shipping address selected.</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-medium">Default billing address</h2>
          {defaultBillingAddress ? (
            <AddressCard address={defaultBillingAddress} locale={locale} onRemove={onRemove} />
          ) : (
            <p className="text-sm text-charcoal-light">No default billing address selected.</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-medium">Additional addresses</h2>
          {additionalAddresses.length > 0 ? (
            <div className="space-y-3">
              {additionalAddresses.map((address) => (
                <AddressCard key={address.id} address={address} locale={locale} onRemove={onRemove} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal-light">No additional addresses.</p>
          )}
        </section>
      </div>

      {status === 'error' && <p className="text-sm text-red-600">Could not remove the address.</p>}
    </div>
  );
}
