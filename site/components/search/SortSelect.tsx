'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Dropdown from '@/components/ui/atoms/dropdown';

const OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-charcoal-light">
      <span className="hidden md:inline">Sort by</span>
      <Dropdown
        name="sort-by"
        value={searchParams.get('sort') ?? 'relevance'}
        onChange={onChange}
        items={OPTIONS}
        containerClassName="min-w-41"
      />
    </label>
  );
}
