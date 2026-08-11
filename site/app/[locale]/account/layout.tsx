'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { isSignedIn, isLoading, logout } = useAccount();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isSignedIn, locale, router]);

  if (isLoading || !isSignedIn) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-charcoal-light">Loading account…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 grid md:grid-cols-[180px_1fr] gap-10">
      <nav className="space-y-2 text-sm">
        <Link href="/account" locale={locale} className="block hover:text-terra">
          Overview
        </Link>
        <Link href="/account/profile" locale={locale} className="block hover:text-terra">
          Profile
        </Link>
        <Link href="/account/orders" locale={locale} className="block hover:text-terra">
          Orders
        </Link>
        <Link href="/account/addresses" locale={locale} className="block hover:text-terra">
          Addresses
        </Link>
        <Link href="/account/wishlists" locale={locale} className="block hover:text-terra">
          Wishlists
        </Link>
        <button onClick={() => logout().then(() => router.push(`/${locale}`))} className="block text-charcoal-light hover:text-red-600">
          Sign out
        </button>
      </nav>
      <div>{children}</div>
    </div>
  );
}
