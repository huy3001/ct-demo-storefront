'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useTranslations } from 'use-intl';
import type { Customer } from '@commercetools/platform-sdk';
import { useAccount } from '@/hooks/useAccount';
import { customerPhone } from '@/lib/customer-profile';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import PasswordInput from '@/components/ui/atoms/input-password';

export default function AccountProfilePage() {
  const { customer } = useAccount();
  const translate = useTranslations();

  if (!customer)
    return (
      <p className="text-sm text-charcoal-light">
        {translate('common.loading')}
      </p>
    );

  return (
    <ProfileForm
      key={`${customer.id}-${customer.version}`}
      customer={customer}
    />
  );
}

function ProfileForm({ customer }: { customer: Customer }) {
  const translate = useTranslations();
  const { mutate } = useSWRConfig();
  const [form, setForm] = useState({
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email,
    phone: customerPhone(customer),
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  );
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [passwordError, setPasswordError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updatedCustomer = await res.json();
      await mutate('/api/account', updatedCustomer, { revalidate: false });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordStatus('error');
      setPasswordError(translate('error.password-noMatch'));
      return;
    }

    setPasswordStatus('saving');
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message ?? translate('error.password-unable-change'),
        );
      }
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStatus('saved');
    } catch (error) {
      setPasswordStatus('error');
      setPasswordError(
        error instanceof Error
          ? error.message
          : translate('error.password-unable-change'),
      );
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-6 text-xl font-semibold">
          {translate('account.update-profile')}
        </h1>
        <form
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <Input
                label={translate('common.firstName')}
                id="firstName"
                required
                placeholder={translate('common.firstName')}
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
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <Input
                label={translate('common.email')}
                id="email"
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="form-field w-1/2">
              <Input
                label={translate('common.phone')}
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder={translate('common.phone')}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={status === 'saving'}
          >
            {status === 'saving'
              ? translate('account.saving')
              : translate('account.save-changes')}
          </Button>
          {status === 'saved' && (
            <p className="text-sm text-sage">{translate('account.saved')}</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600">
              {translate('error.wentWrong')}
            </p>
          )}
        </form>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">
          {translate('account.password-change')}
        </h2>
        <form
          onSubmit={onPasswordSubmit}
          className="space-y-6"
        >
          <div className="form-field w-full">
            <PasswordInput
              label={translate('account.password-current')}
              id="currentPassword"
              required
              autoComplete="current-password"
              placeholder={translate('account.password-current')}
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((value) => ({
                  ...value,
                  currentPassword: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <PasswordInput
                label={translate('account.password-new')}
                id="newPassword"
                required
                autoComplete="new-password"
                placeholder={translate('account.password-new')}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((value) => ({
                    ...value,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field w-1/2">
              <PasswordInput
                label={translate('account.password-confirm')}
                id="confirmPassword"
                required
                autoComplete="new-password"
                placeholder={translate('account.password-confirm')}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((value) => ({
                    ...value,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={passwordStatus === 'saving'}
          >
            {passwordStatus === 'saving'
              ? translate('account.changing')
              : translate('account.change-password')}
          </Button>
          {passwordStatus === 'saved' && (
            <p className="text-sm text-sage">
              {translate('account.password-changed')}
            </p>
          )}
          {passwordStatus === 'error' && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
        </form>
      </section>
    </div>
  );
}
