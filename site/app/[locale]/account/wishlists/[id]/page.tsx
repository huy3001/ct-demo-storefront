import WishlistDetailPage from '@/components/wishlist/WishlistDetailPage';

export default async function AccountWishlistDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return <WishlistDetailPage locale={locale} wishlistId={id} />;
}
