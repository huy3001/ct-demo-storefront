'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-12 text-sm">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 border border-border rounded-sm disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-charcoal-light">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 border border-border rounded-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
