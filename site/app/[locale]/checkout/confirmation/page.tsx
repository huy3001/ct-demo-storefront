import { Link } from '@/i18n/routing';

export default async function CheckoutConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}) {
  const { locale } = await params;
  const { orderId, orderNumber } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold mb-4">Thank you for your order!</h1>
      {orderNumber && <p className="text-charcoal-light">Order number: {orderNumber}</p>}
      {!orderNumber && orderId && <p className="text-charcoal-light">Order ID: {orderId}</p>}
      <Link href="/" locale={locale} className="inline-block mt-8 text-terra hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}
