'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { useTranslations } from 'use-intl';
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
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'country'
  | 'state'
  | 'city'
  | 'streetName'
  | 'postalCode'
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
  const translate = useTranslations();
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
  const [defaultShipping, setDefaultShipping] = useState(
    initialDefaultShipping,
  );
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
    if (
      ![form.firstName, form.lastName, form.email, form.state].every((value) =>
        value?.trim(),
      )
    ) {
      setValidationError(translate('address.required-fields'));
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
            label={translate('common.firstName')}
            id="firstName"
            required
            placeholder={translate('common.firstName')}
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) =>
              setForm((f) => ({ ...f, firstName: e.target.value }))
            }
          />
        </div>
        <div className="form-field w-1/2">
          <Input
            label={translate('common.lastName')}
            id="lastName"
            required
            placeholder={translate('common.lastName')}
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
            label={translate('common.email')}
            id="email"
            required
            type="email"
            placeholder={translate('common.email')}
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="form-field w-1/2">
          <Input
            label={translate('common.phone')}
            id="phone"
            type="tel"
            placeholder={translate('common.phone')}
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>
      <div className="form-field w-full">
        <Input
          label={translate('address.street-address')}
          id="streetName"
          required
          placeholder={translate('address.street-address')}
          value={form.streetName}
          onChange={(e) =>
            setForm((f) => ({ ...f, streetName: e.target.value }))
          }
        />
      </div>
      <div className="flex gap-4">
        <div className="form-field w-1/2">
          <Input
            label={translate('common.city')}
            id="city"
            required
            placeholder={translate('common.city')}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div className="form-field w-1/2">
          <Input
            label={translate('common.zipCode')}
            id="postalCode"
            required
            placeholder={translate('common.zipCode')}
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
            label={translate('common.state')}
            id="state"
            required
            placeholder={translate('common.state')}
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          />
        </div>
        <div className="form-field w-1/2">
          <Dropdown
            label={translate('common.country')}
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
          label={translate('address.set-default-shipping')}
          checked={defaultShipping}
          onChange={(e) => setDefaultShipping(e.checked)}
          containerClassName="cursor-pointer"
        />
        <Checkbox
          label={translate('address.set-default-billing')}
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
          ? translate('account.saving')
          : addressId
            ? translate('account.save-address')
            : translate('account.address-add')}
      </Button>
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600">{translate('error.wentWrong')}</p>
      )}
    </form>
  );
}
