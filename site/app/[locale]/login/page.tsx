'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import PasswordInput from '@/components/ui/atoms/input-password';

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
        className="space-y-6"
      >
        <div className="form-field w-full">
          <Input
            label="Email"
            placeholder="Email"
            variant="primary"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field w-full">
          <PasswordInput
            label="Password"
            placeholder="Password"
            variant="primary"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          size="full"
          variant="primary"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
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
