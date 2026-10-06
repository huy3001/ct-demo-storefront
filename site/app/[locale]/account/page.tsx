'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import {
  HeartIcon,
  UserIcon,
  ChatBubbleLeftRightIcon as QuotesIcon,
  ShoppingCartIcon as OrdersIcon,
  BuildingOfficeIcon as CompanyIcon,
  MapPinIcon as AddressesIcon,
  CheckIcon as ApprovalIcon,
  ArrowsRightLeftIcon as FlowIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Card from '@/components/ui/molecules/card';
import Skeleton from '@/components/ui/atoms/skeleton';

export default function AccountProfilePage() {
  const { customer } = useAccount();
  const { locale } = useParams<{ locale: string }>();
  const translate = useTranslations();

  if (!customer) {
    return <Skeleton className="h-5 w-full" />;
  }

  const dashboardCards = [
    {
      href: '/account/profile',
      icon: <UserIcon />,
      title: translate('account.profile'),
      summary: `${customer.firstName} ${customer.lastName}`,
    },
    {
      href: '/account/addresses',
      icon: <AddressesIcon />,
      title: translate('account.addresses'),
      summary: `${customer.addresses?.length ?? 0} ${translate('account.saved-addresses')}`,
    },
    {
      href: '/account/approval-flows',
      icon: <FlowIcon />,
      title: translate('account.approval-flows'),
      summary: translate('account.approval-flows-summary'),
    },
    {
      href: '/account/approval-rules',
      icon: <ApprovalIcon />,
      title: translate('account.approval-rules'),
      summary: translate('account.approval-rules-summary'),
    },
    {
      href: '/account/company',
      icon: <CompanyIcon />,
      title: translate('account.company'),
      summary: translate('account.company-summary'),
    },
    {
      href: '/account/orders',
      icon: <OrdersIcon />,
      title: translate('account.orders'),
      summary: translate('account.view-orders'),
    },
    {
      href: '/account/quotes',
      icon: <QuotesIcon />,
      title: translate('account.quotes'),
      summary: translate('account.quotes-summary'),
    },
    {
      href: '/account/wishlists',
      icon: <HeartIcon />,
      title: translate('account.wishlists'),
      summary: translate('account.view-wishlists'),
    },
  ];

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
        {dashboardCards.map(({ href, icon, title, summary }) => (
          <Link
            key={href}
            href={href}
            locale={locale}
          >
            <Card
              icon={icon}
              title={title}
              summary={summary}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
