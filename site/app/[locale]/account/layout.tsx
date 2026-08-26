'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoading, logout } = useAccount();

  const accountLinks = [
    { href: '/account', label: 'Overview' },
    { href: '/account/profile', label: 'Profile' },
    { href: '/account/orders', label: 'Orders' },
    { href: '/account/addresses', label: 'Addresses' },
    { href: '/account/wishlists', label: 'Wishlists' },
  ];

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isSignedIn, locale, router]);

  if (isLoading || !isSignedIn) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-charcoal-light">Loading account…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-[180px_1fr] gap-10">
      <aside className="lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold mb-6">My account</h2>
        <nav className="space-y-2 text-sm">
          {accountLinks.map(({ href, label }) => {
            const active = pathname === `/${locale}${href}`;

            return (
              <Link
                key={href}
                href={href}
                locale={locale}
                className={`block hover:text-terra ${active ? 'text-terra' : ''}`}
              >
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => logout().then(() => router.push(`/${locale}`))}
            className="block text-charcoal-light hover:text-red-600"
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
