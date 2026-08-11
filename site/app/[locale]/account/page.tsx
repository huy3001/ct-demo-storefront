'use client';

import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function AccountProfilePage() {
  const { customer } = useAccount();
  const { locale } = useParams<{ locale: string }>();

  if (!customer) {
    return <p className="text-charcoal-light text-sm">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Account overview</h1>
      <p className="mt-2 text-sm text-charcoal-light">Welcome back, {customer.firstName || customer.email}.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/account/profile" locale={locale} className="rounded-sm border border-border bg-white p-5 hover:border-terra">
          <h2 className="font-medium">Profile</h2>
          <p className="mt-2 text-sm text-charcoal-light">{customer.firstName} {customer.lastName}</p>
          <p className="text-sm text-charcoal-light">{customer.email}</p>
        </Link>
        <Link href="/account/addresses" locale={locale} className="rounded-sm border border-border bg-white p-5 hover:border-terra">
          <h2 className="font-medium">Addresses</h2>
          <p className="mt-2 text-sm text-charcoal-light">{customer.addresses?.length ?? 0} saved addresses</p>
        </Link>
        <Link href="/account/orders" locale={locale} className="rounded-sm border border-border bg-white p-5 hover:border-terra">
          <h2 className="font-medium">Orders</h2>
          <p className="mt-2 text-sm text-charcoal-light">View your order history</p>
        </Link>
        <Link href="/account/wishlists" locale={locale} className="rounded-sm border border-border bg-white p-5 hover:border-terra">
          <h2 className="font-medium">Wishlists</h2>
          <p className="mt-2 text-sm text-charcoal-light">View your saved products</p>
        </Link>
      </div>
    </div>
  );
}
