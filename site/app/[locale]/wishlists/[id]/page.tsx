import { redirect } from 'next/navigation';
import WishlistDetailPage from '@/components/wishlist/WishlistDetailPage';
import { getSession } from '@/lib/ct/session';

export default async function WishlistDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await getSession();
  if (!session?.customerId) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/wishlists/${id}`)}`);
  }

  return <WishlistDetailPage locale={locale} wishlistId={id} />;
}
