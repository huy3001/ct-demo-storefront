'use client';

import { useParams } from 'next/navigation';
import { useAccount } from '@/hooks/useAccount';
import AddressForm from '@/components/account/AddressForm';
import { Link } from '@/i18n/routing';

export default function EditAddressPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const { customer, isLoading } = useAccount();
  const address = customer?.addresses?.find((item) => item.id === id);

  if (isLoading) return <p className="text-sm text-charcoal-light">Loading…</p>;
  if (!address) return <p className="text-sm text-charcoal-light">Address not found.</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Edit address</h1>
        <Link
          href="/account/addresses"
          locale={locale}
          className="inline-block text-sm text-terra hover:underline"
        >
          Back to addresses
        </Link>
      </div>
      <AddressForm
        addressId={id}
        initialAddress={address}
      />
    </div>
  );
}
