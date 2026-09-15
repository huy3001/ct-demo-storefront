'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import type { Customer } from '@commercetools/platform-sdk';
import { useAccount } from '@/hooks/useAccount';
import { customerPhone } from '@/lib/customer-profile';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import PasswordInput from '@/components/ui/atoms/input-password';

export default function AccountProfilePage() {
  const { customer } = useAccount();
  if (!customer) return <p className="text-sm text-charcoal-light">Loading…</p>;
  return <ProfileForm key={`${customer.id}-${customer.version}`} customer={customer} />;
}

function ProfileForm({ customer }: { customer: Customer }) {
  const { mutate } = useSWRConfig();
  const [form, setForm] = useState({
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email,
    phone: customerPhone(customer),
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordStatus('saving');
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Unable to change password.');
      }
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus('saved');
    } catch (error) {
      setPasswordStatus('error');
      setPasswordError(error instanceof Error ? error.message : 'Unable to change password.');
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-6 text-xl font-semibold">Update profile</h1>
        <form
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <Input
                label="First name"
                id="firstName"
                required
                placeholder="First name"
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
                label="Email"
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
                label="Phone number"
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone number (optional)"
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
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
          {status === 'saved' && <p className="text-sm text-sage">Saved.</p>}
          {status === 'error' && (
            <p className="text-sm text-red-600">Something went wrong.</p>
          )}
        </form>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">Change password</h2>
        <form
          onSubmit={onPasswordSubmit}
          className="space-y-6"
        >
          <div className="form-field w-full">
            <PasswordInput
              label="Current password"
              id="currentPassword"
              required
              autoComplete="current-password"
              placeholder="Current password"
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
                label="New password"
                id="newPassword"
                required
                autoComplete="new-password"
                placeholder="New password"
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
                label="Confirm new password"
                id="confirmPassword"
                required
                autoComplete="new-password"
                placeholder="Confirm new password"
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
            {passwordStatus === 'saving' ? 'Changing…' : 'Change password'}
          </Button>
          {passwordStatus === 'saved' && (
            <p className="text-sm text-sage">Password changed.</p>
          )}
          {passwordStatus === 'error' && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
        </form>
      </section>
    </div>
  );
}
