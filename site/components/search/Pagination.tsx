'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/atoms/button';

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
      <Button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        size="icon"
        variant="secondary"
      >
        <ArrowLeftIcon className="size-4" />
      </Button>
      <span className="text-charcoal-light">
        Page {page} of {totalPages}
      </span>
      <Button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        size="icon"
        variant="secondary"
      >
        <ArrowRightIcon className="size-4" />
      </Button>
    </div>
  );
}
