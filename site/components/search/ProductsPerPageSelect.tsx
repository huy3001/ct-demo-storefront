'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PRODUCT_PAGE_SIZES } from '@/lib/search-params';

export default function ProductsPerPageSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', event.target.value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-charcoal-light">
      <span>Show</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-sm border border-border bg-white px-3 py-2 text-sm text-charcoal"
        aria-label="Products per page"
      >
        {PRODUCT_PAGE_SIZES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
