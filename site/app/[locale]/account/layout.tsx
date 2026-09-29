'use client';

import { ReactNode, useEffect } from 'react';
import { useTranslations } from 'use-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Button from '@/components/ui/atoms/button';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const translate = useTranslations();
  const { isSignedIn, isLoading, logout } = useAccount();

  const accountLinks = [
    { href: '/account', label: translate('account.dashboard') },
    { href: '/account/profile', label: translate('account.profile') },
    { href: '/account/orders', label: translate('account.orders') },
    { href: '/account/addresses', label: translate('account.addresses') },
    { href: '/account/wishlists', label: translate('account.wishlists') },
  ];

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isSignedIn, locale, router]);

  if (isLoading || !isSignedIn) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-charcoal-light">
        {translate('common.loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-[180px_1fr] gap-10">
      <aside className="lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold mb-6">
          {translate('account.my-account')}
        </h2>
        <nav className="space-y-4">
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
          <Button
            variant="secondary"
            onClick={() => logout().then(() => router.push(`/${locale}`))}
            className="leading-3.5 mt-6 w-full"
          >
            {translate('account.sign-out')}
          </Button>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
