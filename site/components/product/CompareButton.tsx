'use client';

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { ScaleIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/lib/types';
import {
  addComparedProduct,
  COMPARE_PRODUCTS_EVENT,
  getComparedProducts,
  MAX_COMPARE_PRODUCTS,
  removeComparedProduct,
} from '@/lib/compare';
import useClassNames from '@/hooks/useClassNames';

interface CompareButtonProps {
  product: Product;
  locale: string;
}

export default function CompareButton({ product, locale }: CompareButtonProps) {
  const [isCompared, setIsCompared] = useState(false);

  const pathClassNames = useClassNames([
    'size-6 lg:size-8 transition duration-150 ease-out hover:fill-red-500 hover:stroke-red-500',
    isCompared ? 'fill-red-500 stroke-red-500' : '!fill-white',
  ]);

  useEffect(() => {
    const updateState = () => {
      setIsCompared(getComparedProducts(locale).some((item) => item.id === product.id));
    };

    updateState();
    window.addEventListener(COMPARE_PRODUCTS_EVENT, updateState);
    return () => window.removeEventListener(COMPARE_PRODUCTS_EVENT, updateState);
  }, [locale, product.id]);

  function toggleComparison() {
    if (isCompared) {
      removeComparedProduct(product.id, locale);
      toast.success('Product removed from compare');
      return;
    }

    if (!addComparedProduct(product, locale)) {
      toast.error(`You can compare up to ${MAX_COMPARE_PRODUCTS} products`);
      return;
    }

    toast.success('Product added to compare');
  }

  return (
    <button
      type="button"
      onClick={toggleComparison}
      aria-pressed={isCompared}
      aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
    >
      <ScaleIcon
        className={pathClassNames}
        strokeWidth={'1'}
      />
    </button>
  );
}
