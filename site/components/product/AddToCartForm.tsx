'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';

export default function AddToCartForm({ product, locale }: { product: Product; locale: string }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const attributeOptions = useMemo(() => {
    const options = new Map<string, Set<string>>();
    for (const variant of product.variants) {
      for (const attr of variant.attributes) {
        const value = typeof attr.value === 'object' && attr.value !== null ? (attr.value as { key?: string }).key ?? String(attr.value) : String(attr.value);
        if (!options.has(attr.name)) options.set(attr.name, new Set());
        options.get(attr.name)!.add(value);
      }
    }
    return options;
  }, [product.variants]);

  const matchingVariant = useMemo(() => {
    return (
      product.variants.find((variant) =>
        variant.attributes.every((attr) => {
          const value = typeof attr.value === 'object' && attr.value !== null ? (attr.value as { key?: string }).key ?? String(attr.value) : String(attr.value);
          return !selected[attr.name] || selected[attr.name] === value;
        })
      ) ?? product.variants[0]
    );
  }, [product.variants, selected]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matchingVariant) return;
    setStatus('loading');
    try {
      await addItem(product.id, matchingVariant.id, quantity);
      setStatus('idle');
      router.push(`/${locale}/cart`);
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {[...attributeOptions.entries()].map(([name, values]) => (
        <div key={name}>
          <label className="text-sm font-medium text-charcoal capitalize block mb-2">{name}</label>
          <div className="flex gap-2 flex-wrap">
            {[...values].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setSelected((prev) => ({ ...prev, [name]: value }))}
                className={`px-3 py-1.5 text-sm border rounded-sm ${
                  selected[name] === value ? 'border-charcoal bg-charcoal text-white' : 'border-border'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" htmlFor="quantity">
          Qty
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-16 border border-border rounded-sm px-2 py-1.5 text-sm"
        />
      </div>

      {matchingVariant?.price && (
        <p className="text-lg font-semibold">
          {formatMoney(matchingVariant.price.centAmount, matchingVariant.price.currencyCode, locale)}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !matchingVariant}
        className="w-full bg-charcoal text-white py-3 rounded-sm text-sm hover:bg-charcoal-light disabled:opacity-50"
      >
        {status === 'loading' ? 'Adding…' : 'Add to cart'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
    </form>
  );
}
