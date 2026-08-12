import AddressForm from '@/components/account/AddressForm';
import { Link } from '@/i18n/routing';

export default async function NewAddressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Add new address</h1>
        <Link
          href="/account/addresses"
          locale={locale}
          className="mb-4 inline-block text-sm text-terra hover:underline"
        >
          Back to addresses
        </Link>
      </div>
      <AddressForm />
    </div>
  );
}
