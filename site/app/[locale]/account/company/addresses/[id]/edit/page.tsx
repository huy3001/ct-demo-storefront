'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import AddressForm from '@/components/account/AddressForm';
import Skeleton from '@/components/ui/atoms/skeleton';
import { Link } from '@/i18n/routing';
import type { CompanyManagement } from '@/lib/company';

async function fetchCompany(url: string): Promise<CompanyManagement> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? 'Unable to load company information');
  }
  return response.json() as Promise<CompanyManagement>;
}

export default function EditCompanyAddressPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const translate = useTranslations();
  const { data, error } = useSWR('/api/account/company', fetchCompany, {
    revalidateOnFocus: false,
  });
  const address = data?.addresses.find((item) => item.id === id);

  if (error) return <p className="text-sm text-red-600">{error.message}</p>;
  if (!data) return <Skeleton className="h-5 w-full" />;

  if (!address) {
    return (
      <p className="text-sm text-charcoal-light text-center">
        {translate('address.not-found')}
      </p>
    );
  }

  const companyAddress = {
    firstName: address.firstName ?? '',
    lastName: address.lastName ?? '',
    company: address.company ?? address.companyName,
    phone: address.phone ?? '',
    country: address.country,
    state: address.state,
    city: address.city,
    streetName: address.address,
    postalCode: address.postcode,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{translate('address.edit')}</h1>
        <Link
          href="/account/company"
          locale={locale}
          className="inline-block text-sm text-terra hover:underline"
        >
          {translate('account.company-back')}
        </Link>
      </div>

      <AddressForm
        addressId={address.id}
        companyId={address.businessUnitId}
        initialAddress={companyAddress}
        initialDefaultShipping={address.isDefaultShipping}
        initialDefaultBilling={address.isDefaultBilling}
      />
    </div>
  );
}
