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

export default function NewCompanyAddressPage() {
  const { locale } = useParams<{ locale: string }>();
  const translate = useTranslations();
  const { data, error } = useSWR('/api/account/company', fetchCompany, {
    revalidateOnFocus: false,
  });

  if (error) return <p className="text-sm text-red-600">{error.message}</p>;
  if (!data) return <Skeleton className="h-5 w-full" />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          {translate('account.address-add')}
        </h1>
        <Link
          href="/account/company"
          locale={locale}
          className="inline-block text-sm text-terra hover:underline"
        >
          {translate('account.company-back')}
        </Link>
      </div>

      <AddressForm companyId={data.company.id} />
    </div>
  );
}
