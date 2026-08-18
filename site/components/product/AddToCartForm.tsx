'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';
import { formatAttributeValue, humanizeAttributeName } from '@/lib/product-attributes';
import { useProductVariant } from '@/components/product/ProductVariantProvider';

export default function AddToCartForm({
  product,
  locale,
  attributeLabels,
}: {
  product: Product;
  locale: string;
  attributeLabels: Record<string, string>;
}) {
  const { addItem } = useCart();
  const { attributeOptions, matchingVariant, selected, selectAttribute } = useProductVariant();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const isUnavailable = matchingVariant?.availability?.isOnStock === false || !matchingVariant?.price;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matchingVariant || isUnavailable) return;
    setStatus('loading');
    try {
      await addItem(product.id, matchingVariant.id, quantity);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {matchingVariant?.price && (
        <div>
          {matchingVariant.price.discounted ? (
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-terra">
                {formatMoney(matchingVariant.price.discounted.centAmount, matchingVariant.price.discounted.currencyCode, locale)}
              </p>
              <p className="text-sm text-charcoal-light line-through">
                {formatMoney(matchingVariant.price.centAmount, matchingVariant.price.currencyCode, locale)}
              </p>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-charcoal">
              {formatMoney(matchingVariant.price.centAmount, matchingVariant.price.currencyCode, locale)}
            </p>
          )}
          <p className={`mt-2 text-sm ${isUnavailable ? 'text-red-600' : 'text-sage'}`}>
            {isUnavailable ? 'Currently unavailable' : 'In stock and ready to ship'}
          </p>
        </div>
      )}

      {[...attributeOptions.entries()].map(([name, values]) => (
        <div key={name}>
          <label className="mb-2 block text-sm font-medium text-charcoal">
            {attributeLabels[name] ?? humanizeAttributeName(name)}
          </label>
          <div className="flex gap-2 flex-wrap">
            {[...values].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => selectAttribute(name, value)}
                aria-pressed={selected[name] === value}
                className={`rounded-sm border px-4 py-2 text-sm ${
                  selected[name] === value ? 'border-charcoal bg-charcoal text-white' : 'border-border bg-white hover:border-charcoal'
                }`}
              >
                {formatAttributeValue(value, locale)}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="quantity">Quantity</label>
        <div className="inline-flex h-11 items-center rounded-sm border border-border bg-white">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} className="h-full w-11 text-lg disabled:opacity-30" aria-label="Decrease quantity">−</button>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => {
              const nextQuantity = Number.parseInt(e.target.value, 10);
              setQuantity(Number.isFinite(nextQuantity) ? Math.max(1, nextQuantity) : 1);
            }}
            className="h-full w-12 border-x border-border bg-transparent text-center text-sm outline-none"
          />
          <button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-full w-11 text-lg" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || !matchingVariant || isUnavailable}
        className="w-full rounded-sm bg-charcoal py-3.5 text-sm font-medium text-white hover:bg-terra disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? 'Adding…' : isUnavailable ? 'Unavailable' : 'Add to cart'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
    </form>
  );
}
