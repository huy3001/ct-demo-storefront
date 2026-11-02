import WishlistListPage from '@/components/wishlist/WishlistListPage';

export default async function AccountWishlistsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <WishlistListPage locale={locale} />;
}
