'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import { useAccount } from '@/hooks/useAccount';
import { useWishlist } from '@/hooks/useWishlist';
import { COUNTRY_CONFIG } from '@/lib/utils';

export default function Header({ locale }: { locale: string }) {
  const { itemCount } = useCart();
  const { isSignedIn } = useAccount();
  const { totalItems: wishlistCount } = useWishlist();
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
  }

  function onLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    document.cookie = `your-shop-country-locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const rest = window.location.pathname.split('/').slice(2).join('/');
    window.location.href = `/${next}/${rest}`;
  }

  return (
    <header className="border-b border-border bg-cream sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
        <Link href="/" locale={locale} className="text-xl font-semibold tracking-tight text-charcoal shrink-0">
          Storefront
        </Link>

        <nav className="hidden md:flex gap-5 text-sm text-charcoal-light shrink-0">
          <Link href="/category/all" locale={locale} className="hover:text-charcoal">
            Shop
          </Link>
        </nav>

        <form onSubmit={onSearchSubmit} className="flex-1 max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search products…"
            className="w-full rounded-sm border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-terra"
          />
        </form>

        <div className="flex items-center gap-4 shrink-0 text-sm">
          <select
            defaultValue={locale}
            onChange={onLocaleChange}
            className="border border-border rounded-sm bg-white px-2 py-1 text-sm"
            aria-label="Select locale"
          >
            {Object.keys(COUNTRY_CONFIG).map((l) => (
              <option key={l} value={l}>
                {COUNTRY_CONFIG[l].label}
              </option>
            ))}
          </select>

          <Link href={isSignedIn ? '/account' : '/login'} locale={locale} className="hover:text-terra">
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>

          <Link
            href={isSignedIn ? '/wishlists' : `/login?redirect=${encodeURIComponent(`/${locale}/wishlists`)}`}
            locale={locale}
            className="relative hover:text-terra"
            aria-label="Wishlist"
          >
            <span aria-hidden>{isSignedIn ? '♥' : '♡'}</span>
            {isSignedIn && wishlistCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-terra text-white text-xs w-5 h-5">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" locale={locale} className="relative hover:text-terra">
            Cart
            {itemCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-terra text-white text-xs w-5 h-5">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
