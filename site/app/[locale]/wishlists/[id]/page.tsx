import { redirect } from 'next/navigation';

export default async function WishlistDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/account/wishlists/${id}`);
}
