'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import type { BaseAddress } from '@commercetools/platform-sdk';
import { useAccount } from '@/hooks/useAccount';
import { customerPhone } from '@/lib/customer-profile';
import { COUNTRY_CONFIG } from '@/lib/utils';

type AddressFields = Pick<
  BaseAddress,
  'firstName' | 'lastName' | 'email' | 'phone' | 'country' | 'state' | 'city' | 'streetName' | 'postalCode'
>;

export default function AddressForm({
  addressId,
  initialAddress,
  initialDefaultShipping = false,
  initialDefaultBilling = false,
}: {
  addressId?: string;
  initialAddress?: AddressFields;
  initialDefaultShipping?: boolean;
  initialDefaultBilling?: boolean;
}) {
  const { locale } = useParams<{ locale: string }>();
  const country = locale.split('-')[1] ?? 'US';
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { customer } = useAccount();
  const [form, setForm] = useState<AddressFields>({
    firstName: initialAddress?.firstName || customer?.firstName || '',
    lastName: initialAddress?.lastName || customer?.lastName || '',
    email: initialAddress?.email || customer?.email || '',
    phone: initialAddress?.phone || customerPhone(customer),
    country: initialAddress?.country ?? country,
    state: initialAddress?.state ?? '',
    city: initialAddress?.city ?? '',
    streetName: initialAddress?.streetName ?? '',
    postalCode: initialAddress?.postalCode ?? '',
  });
  const [defaultShipping, setDefaultShipping] = useState(initialDefaultShipping);
  const [defaultBilling, setDefaultBilling] = useState(initialDefaultBilling);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [validationError, setValidationError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (![form.firstName, form.lastName, form.email, form.state].every((value) => value?.trim())) {
      setValidationError('First name, last name, email address, and state are required.');
      return;
    }

    setValidationError('');
    setStatus('saving');
    try {
      const res = await fetch('/api/account/addresses', {
        method: addressId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(addressId ? { addressId } : {}),
          address: form,
          defaultShipping,
          defaultBilling,
        }),
      });
      if (!res.ok) throw new Error();
      const updatedCustomer = await res.json();
      await mutate('/api/account', updatedCustomer, { revalidate: false });
      router.push(`/${locale}/account/addresses`);
      router.refresh();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="flex gap-3">
        <div className="form-field w-1/2">
          <label
            htmlFor="firstName"
            className="block text-sm mb-1"
          >
            First name
          </label>
          <input
            id="firstName"
            required
            placeholder="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) =>
              setForm((f) => ({ ...f, firstName: e.target.value }))
            }
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="form-field w-1/2">
          <label
            htmlFor="lastName"
            className="block text-sm mb-1"
          >
            Last name
          </label>
          <input
            id="lastName"
            required
            placeholder="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastName: e.target.value }))
            }
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="form-field w-1/2">
          <label
            htmlFor="email"
            className="block text-sm mb-1"
          >
            Email
          </label>
          <input
            id="email"
            required
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="form-field w-1/2">
          <label
            htmlFor="phone"
            className="block text-sm mb-1"
          >
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Phone number (optional)"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="form-field w-full">
        <label
          htmlFor="streetName"
          className="block text-sm mb-1"
        >
          Street address
        </label>
        <input
          id="streetName"
          required
          placeholder="Street"
          value={form.streetName}
          onChange={(e) =>
            setForm((f) => ({ ...f, streetName: e.target.value }))
          }
          className="w-full rounded-sm border border-border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div className="form-field w-1/2">
          <label
            htmlFor="city"
            className="block text-sm mb-1"
          >
            City
          </label>
          <input
            id="city"
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="form-field w-1/2">
          <label
            htmlFor="postalCode"
            className="block text-sm mb-1"
          >
            Postal code
          </label>
          <input
            id="postalCode"
            required
            placeholder="Postal code"
            value={form.postalCode}
            onChange={(e) =>
              setForm((f) => ({ ...f, postalCode: e.target.value }))
            }
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="form-field w-1/2">
          <label
            htmlFor="state"
            className="block text-sm mb-1"
          >
            State
          </label>
          <input
            id="state"
            required
            placeholder="State"
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="form-field w-1/2">
          <label
            htmlFor="country"
            className="block text-sm mb-1"
          >
            Country
          </label>
          <select
            id="country"
            required
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))
            }
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          >
            {Object.entries(COUNTRY_CONFIG).map(([countryCode, config]) => (
              <option key={countryCode} value={config.country}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={defaultShipping}
            onChange={(e) => setDefaultShipping(e.target.checked)}
            className="h-4 w-4 accent-charcoal"
          />
          Set as default shipping address
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={defaultBilling}
            onChange={(e) => setDefaultBilling(e.target.checked)}
            className="h-4 w-4 accent-charcoal"
          />
          Set as default billing address
        </label>
      </div>
      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded-sm bg-charcoal px-5 py-2 text-sm text-white hover:bg-charcoal-light disabled:opacity-60"
      >
        {status === 'saving'
          ? 'Saving…'
          : addressId
            ? 'Save address'
            : 'Add address'}
      </button>
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong.</p>
      )}
    </form>
  );
}
