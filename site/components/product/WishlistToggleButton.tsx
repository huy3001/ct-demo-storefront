'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount } from '@/hooks/useAccount';
import { useWishlist } from '@/hooks/useWishlist';

export default function WishlistToggleButton({
  productId,
  variantId,
  locale,
  className = '',
}: {
  productId: string;
  variantId: number;
  locale: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAccount();
  const { isSaved, toggleSaved } = useWishlist();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved = isSaved(productId, variantId);

  async function onClick() {
    if (!isSignedIn) {
      const redirect = pathname || `/${locale}`;
      router.push(`/${locale}/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await toggleSaved(productId, variantId, locale);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update wishlist');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={saved}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/90 text-lg leading-none text-charcoal hover:border-terra hover:text-terra disabled:opacity-60"
      >
        {saved ? '♥' : '♡'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
