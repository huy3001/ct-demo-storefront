'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import {
  HeartIcon,
  MapPinIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Card from '@/components/ui/molecules/card';

export default function AccountProfilePage() {
  const { customer } = useAccount();
  const { locale } = useParams<{ locale: string }>();
  const translate = useTranslations();

  if (!customer) {
    return (
      <p className="text-charcoal-light text-sm">
        {translate('common.loading')}
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">
        {translate('account.dashboard')}
      </h1>

      <p className="mt-2 text-sm text-charcoal-light">
        {translate('account.welcome-back')},{' '}
        {customer.firstName || customer.email}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/profile"
          locale={locale}
        >
          <Card
            icon={<UserIcon />}
            title={translate('account.profile')}
            summary={`${customer.firstName} ${customer.lastName}`}
          />
        </Link>
        <Link
          href="/account/addresses"
          locale={locale}
        >
          <Card
            icon={<MapPinIcon />}
            title={translate('account.addresses')}
            summary={
              <p>
                {customer.addresses?.length ?? 0}{' '}
                {translate('account.saved-addresses')}
              </p>
            }
          />
        </Link>
        <Link
          href="/account/orders"
          locale={locale}
        >
          <Card
            icon={<ShoppingCartIcon />}
            title={translate('account.orders')}
            summary={translate('account.view-orders')}
          />
        </Link>
        <Link
          href="/account/wishlists"
          locale={locale}
        >
          <Card
            icon={<HeartIcon />}
            title={translate('account.wishlists')}
            summary={translate('account.view-wishlists')}
          />
        </Link>
      </div>
    </div>
  );
}
