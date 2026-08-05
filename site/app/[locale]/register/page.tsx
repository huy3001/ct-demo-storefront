'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function RegisterPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { register } = useAccount();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      router.push(`/${locale}/account`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold mb-8">Create an account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            placeholder="First name"
            value={form.firstName}
            onChange={update('firstName')}
            className="w-1/2 border border-border rounded-sm px-3 py-2 text-sm"
          />
          <input
            placeholder="Last name"
            value={form.lastName}
            onChange={update('lastName')}
            className="w-1/2 border border-border rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={form.password}
          onChange={update('password')}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-charcoal text-white py-2.5 rounded-sm text-sm hover:bg-charcoal-light disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-charcoal-light mt-6">
        Already have an account?{' '}
        <Link href="/login" locale={locale} className="text-terra hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
