'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import type { BaseAddress } from '@commercetools/platform-sdk';
import { useAccount } from '@/hooks/useAccount';
import { customerPhone } from '@/lib/customer-profile';
import { COUNTRY_CONFIG } from '@/lib/utils';
import Button from '@/components/ui/atoms/button';
import Checkbox from '@/components/ui/atoms/checkbox';
import Dropdown from '@/components/ui/atoms/dropdown';
import Input from '@/components/ui/atoms/input';

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

  const dropdownItems = Object.entries(COUNTRY_CONFIG).map(([key, value]) => ({
    id: key,
    label: value.label,
    value: value.country,
  }));

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
      className="space-y-6"
    >
      <div className="flex gap-4">
        <div className="form-field w-1/2">
          <Input
            label="First name"
            id="firstName"
            required
            placeholder="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) =>
              setForm((f) => ({ ...f, firstName: e.target.value }))
            }
          />
        </div>
        <div className="form-field w-1/2">
          <Input
            label="Last name"
            id="lastName"
            required
            placeholder="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastName: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="form-field w-1/2">
          <Input
            label="Email"
            id="email"
            required
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="form-field w-1/2">
          <Input
            label="Phone number"
            id="phone"
            type="tel"
            placeholder="Phone number (optional)"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>
      <div className="form-field w-full">
        <Input
          label="Street address"
          id="streetName"
          required
          placeholder="Street"
          value={form.streetName}
          onChange={(e) =>
            setForm((f) => ({ ...f, streetName: e.target.value }))
          }
        />
      </div>
      <div className="flex gap-4">
        <div className="form-field w-1/2">
          <Input
            label="City"
            id="city"
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div className="form-field w-1/2">
          <Input
            label="Postal code"
            id="postalCode"
            required
            placeholder="Postal code"
            value={form.postalCode}
            onChange={(e) =>
              setForm((f) => ({ ...f, postalCode: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="form-field w-1/2">
          <Input
            label="State"
            id="state"
            required
            placeholder="State"
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          />
        </div>
        <div className="form-field w-1/2">
          <Dropdown
            label="Country"
            id="country"
            required
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))
            }
            items={dropdownItems}
          />
        </div>
      </div>
      <div className="space-y-4 text-sm">
        <Checkbox
          label="Set as default shipping address"
          checked={defaultShipping}
          onChange={(e) => setDefaultShipping(e.checked)}
          containerClassName="cursor-pointer"
        />
        <Checkbox
          label="Set as default billing address"
          checked={defaultBilling}
          onChange={(e) => setDefaultBilling(e.checked)}
          containerClassName="cursor-pointer"
        />
      </div>
      <Button
        type="submit"
        disabled={status === 'saving'}
      >
        {status === 'saving'
          ? 'Saving…'
          : addressId
            ? 'Save address'
            : 'Add address'}
      </Button>
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong.</p>
      )}
    </form>
  );
}
