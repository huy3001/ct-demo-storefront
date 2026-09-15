'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import PasswordInput from '@/components/ui/atoms/input-password';

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
              onChange={update('firstName')}
            />
          </div>
          <div className="form-field w-1/2">
            <Input
              label="Last name"
              id="lastName"
              required
              placeholder="Last name"
              value={form.lastName}
              onChange={update('lastName')}
            />
          </div>
        </div>
        <div className="form-field w-full">
          <Input
            label="Email"
            id="email"
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
          />
        </div>
        <div className="form-field w-full">
          <PasswordInput
            label="Password"
            id="password"
            required
            minLength={8}
            placeholder="Password"
            value={form.password}
            onChange={update('password')}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          size="full"
          variant="primary"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-charcoal-light mt-6">
        <span>Already have an account? </span>
        <Link
          href="/login"
          locale={locale}
          className="text-terra hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
