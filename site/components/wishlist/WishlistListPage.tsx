'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';

export default function WishlistListPage({ locale }: { locale: string }) {
  const { wishlists, isLoading } = useWishlist();

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-charcoal-light">Loading wishlists…</div>;
  }

  if (wishlists.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-charcoal">Wishlists</h1>
        <p className="mt-4 text-charcoal-light">You have no saved items yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal mb-8">Wishlists</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {wishlists.map((wishlist) => {
          const preview = wishlist.lineItems.slice(0, 3);
          return (
            <Link key={wishlist.id} href={`/wishlists/${wishlist.id}`} locale={locale} className="block rounded-sm border border-border bg-white p-5 hover:border-terra">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-charcoal">{wishlist.name}</h2>
                <span className="text-sm text-charcoal-light">{wishlist.lineItems.length} items</span>
              </div>
              <div className="mt-4 flex gap-2">
                {preview.length === 0 ? (
                  <div className="text-sm text-charcoal-light">No items yet</div>
                ) : (
                  preview.map((item) =>
                    item.image ? (
                      <div key={item.lineItemId} className="relative h-14 w-14 overflow-hidden rounded-sm bg-cream-dark">
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      </div>
                    ) : (
                      <div key={item.lineItemId} className="h-14 w-14 rounded-sm bg-cream-dark" />
                    )
                  )
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
