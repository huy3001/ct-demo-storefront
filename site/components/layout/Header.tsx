'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import { useAccount } from '@/hooks/useAccount';
import { useWishlist } from '@/hooks/useWishlist';
import CategoryNavigation from '@/components/layout/CategoryNavigation';
import type { Category } from '@/lib/types';

export default function Header({ locale, categoryTree }: { locale: string; categoryTree: Category[] }) {
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

  return (
    <header className="border-b border-border bg-cream sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" locale={locale} className="text-xl font-semibold tracking-tight text-charcoal shrink-0">
            Huy Store
          </Link>

          <CategoryNavigation locale={locale} categoryTree={categoryTree} />

          <form onSubmit={onSearchSubmit} className="hidden md:block flex-1 max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search products…"
              className="w-full rounded-sm border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-terra"
            />
          </form>

          <div className="ml-auto flex items-center gap-2 md:gap-4 shrink-0 text-sm">
            <Link href={isSignedIn ? '/account' : '/login'} locale={locale} className="hover:text-terra hidden sm:inline">
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

        <form onSubmit={onSearchSubmit} className="mt-3 md:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search products…"
            className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm outline-none focus:border-terra"
          />
        </form>
        <div className="sm:hidden mt-2 text-sm">
          <Link href={isSignedIn ? '/account' : '/login'} locale={locale} className="hover:text-terra">
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>
        </div>
      </div>
    </header>
  );
}
