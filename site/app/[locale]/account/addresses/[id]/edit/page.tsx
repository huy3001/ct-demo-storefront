'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { useAccount } from '@/hooks/useAccount';
import AddressForm from '@/components/account/AddressForm';
import { Link } from '@/i18n/routing';

export default function EditAddressPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const { customer, isLoading } = useAccount();
  const translate = useTranslations();
  const address = customer?.addresses?.find((item) => item.id === id);

  if (isLoading) return (
    <p className="text-sm text-charcoal-light">
      {translate('common.loading')}
    </p>
  );

  if (!address) return (
    <p className="text-sm text-charcoal-light">
      {translate('address.not-found')}
    </p>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{translate('address.edit')}</h1>
        <Link
          href="/account/addresses"
          locale={locale}
          className="inline-block text-sm text-terra hover:underline"
        >
          {translate('address.back')}
        </Link>
      </div>
      <AddressForm
        addressId={id}
        initialAddress={address}
        initialDefaultShipping={customer?.defaultShippingAddressId === id}
        initialDefaultBilling={customer?.defaultBillingAddressId === id}
      />
    </div>
  );
}
