'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const redirectPath = searchParams.get('redirect');
      const safeRedirect = redirectPath && redirectPath.startsWith('/') ? redirectPath : `/${locale}/account`;
      router.push(safeRedirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold mb-8">Sign in</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="form-field w-full">
          <label
            htmlFor="email"
            className="block text-sm mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div className="form-field w-full">
          <label
            htmlFor="password"
            className="block text-sm mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-sm px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-charcoal text-white py-2.5 rounded-sm text-sm hover:bg-charcoal-light disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-charcoal-light mt-6">
        <span>No account? </span>
        <Link
          href="/register"
          locale={locale}
          className="text-terra hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
