'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ScaleIcon } from '@heroicons/react/24/outline';
import {
  COMPARE_PRODUCTS_EVENT,
  getComparedProducts,
} from '@/lib/compare';

export default function CompareHeaderLink() {
  const { locale } = useParams<{ locale?: string }>();
  const [count, setCount] = useState(0);
  const resolvedLocale = locale ?? 'en-US';

  useEffect(() => {
    const updateCount = () => setCount(getComparedProducts(resolvedLocale).length);
    updateCount();
    window.addEventListener(COMPARE_PRODUCTS_EVENT, updateCount);
    return () => window.removeEventListener(COMPARE_PRODUCTS_EVENT, updateCount);
  }, [resolvedLocale]);

  return (
    <a
      href={`/${resolvedLocale}/compare`}
      aria-label={`Compare products${count ? ` (${count})` : ''}`}
      className="flex relative h-fit cursor-pointer border-gray-600 pb-2 hover:border-b-2"
    >
      {count > 0 && (
        <span className="absolute -right-2.5 -top-1 size-2.5 rounded-full bg-green-500" />
      )}
      <ScaleIcon className="w-7 text-charcoal" />
    </a>
  );
}
