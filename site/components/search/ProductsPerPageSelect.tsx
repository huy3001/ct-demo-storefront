'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PRODUCT_PAGE_SIZES } from '@/lib/search-params';
import Dropdown from '@/components/ui/atoms/dropdown';

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
      <Dropdown
        name="products-per-page"
        value={value.toString()}
        onChange={onChange}
        items={PRODUCT_PAGE_SIZES.map((size) => ({
          value: size.toString(),
          label: size.toString(),
        }))}
      />
    </label>
  );
}
