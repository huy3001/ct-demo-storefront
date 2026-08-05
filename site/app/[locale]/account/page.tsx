'use client';

import { useState } from 'react';
import type { Customer } from '@commercetools/platform-sdk';
import { useAccount } from '@/hooks/useAccount';

export default function AccountProfilePage() {
  const { customer } = useAccount();

  if (!customer) {
    return <p className="text-charcoal-light text-sm">Loading…</p>;
  }

  // Keying on customer.id forces a remount (and fresh initial state) whenever the
  // loaded customer changes, avoiding a setState-in-effect anti-pattern.
  return <ProfileForm key={customer.id} customer={customer} />;
}

function ProfileForm({ customer }: { customer: Customer }) {
  const [form, setForm] = useState({
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Profile</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-sm">
        <div className="flex gap-3">
          <input
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className="w-1/2 border border-border rounded-sm px-3 py-2 text-sm"
          />
          <input
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className="w-1/2 border border-border rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-charcoal text-white px-5 py-2 rounded-sm text-sm hover:bg-charcoal-light">
          Save changes
        </button>
        {status === 'saved' && <p className="text-sm text-sage">Saved.</p>}
        {status === 'error' && <p className="text-sm text-red-600">Something went wrong.</p>}
      </form>
    </div>
  );
}
