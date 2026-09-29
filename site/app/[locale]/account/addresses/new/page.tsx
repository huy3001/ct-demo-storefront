'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import AddressForm from '@/components/account/AddressForm';
import { Link } from '@/i18n/routing';

export default function NewAddressPage() {
  const { locale } = useParams<{ locale: string; }>();
  const translate = useTranslations();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          {translate('account.address-add')}
        </h1>
        <Link
          href="/account/addresses"
          locale={locale}
          className="mb-4 inline-block text-sm text-terra hover:underline"
        >
          {translate('address.back')}
        </Link>
      </div>
      <AddressForm />
    </div>
  );
}
