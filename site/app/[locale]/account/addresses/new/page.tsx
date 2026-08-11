import AddressForm from '@/components/account/AddressForm';
import { Link } from '@/i18n/routing';

export default async function NewAddressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div>
      <Link href="/account/addresses" locale={locale} className="mb-4 inline-block text-sm text-terra hover:underline">
        Back to addresses
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Add new address</h1>
      <AddressForm />
    </div>
  );
}
