'use client';

import { useState } from 'react';
import type { Customer } from '@commercetools/platform-sdk';
import { useAccount } from '@/hooks/useAccount';

export default function AccountProfilePage() {
  const { customer } = useAccount();
  if (!customer) return <p className="text-sm text-charcoal-light">Loading…</p>;
  return <ProfileForm key={`${customer.id}-${customer.version}`} customer={customer} />;
}

function ProfileForm({ customer }: { customer: Customer }) {
  const [form, setForm] = useState({ firstName: customer.firstName ?? '', lastName: customer.lastName ?? '', email: customer.email });
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
        <form onSubmit={onSubmit} className="max-w-sm space-y-4">
          <div className="flex gap-3">
            <input placeholder="First name" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="w-1/2 rounded-sm border border-border px-3 py-2 text-sm" />
            <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="w-1/2 rounded-sm border border-border px-3 py-2 text-sm" />
          </div>
          <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
          <button type="submit" disabled={status === 'saving'} className="rounded-sm bg-charcoal px-5 py-2 text-sm text-white hover:bg-charcoal-light disabled:opacity-60">{status === 'saving' ? 'Saving…' : 'Save changes'}</button>
          {status === 'saved' && <p className="text-sm text-sage">Saved.</p>}
          {status === 'error' && <p className="text-sm text-red-600">Something went wrong.</p>}
        </form>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">Change password</h2>
        <form onSubmit={onPasswordSubmit} className="max-w-sm space-y-4">
          <input
            required
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((value) => ({ ...value, currentPassword: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((value) => ({ ...value, newPassword: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords((value) => ({ ...value, confirmPassword: e.target.value }))}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
          <button type="submit" disabled={passwordStatus === 'saving'} className="rounded-sm bg-charcoal px-5 py-2 text-sm text-white hover:bg-charcoal-light disabled:opacity-60">
            {passwordStatus === 'saving' ? 'Changing…' : 'Change password'}
          </button>
          {passwordStatus === 'saved' && <p className="text-sm text-sage">Password changed.</p>}
          {passwordStatus === 'error' && <p className="text-sm text-red-600">{passwordError}</p>}
        </form>
      </section>
    </div>
  );
}
