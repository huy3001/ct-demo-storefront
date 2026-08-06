import { redirect } from 'next/navigation';
import WishlistListPage from '@/components/wishlist/WishlistListPage';
import { getSession } from '@/lib/ct/session';

export default async function WishlistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session?.customerId) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/wishlists`)}`);
  }

  return <WishlistListPage locale={locale} />;
}
