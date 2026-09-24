'use client';

import { useMemo, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/lib/utils';
import { useProductVariant } from '@/components/product/ProductVariantProvider';
import { getLocalizedString, getVariantColorCode } from '@/lib/utils';
import Button from '@/components/ui/atoms/button';
import QuantitySelector from '@/components/ui/atoms/quantity-selector';
import type { Product, Variant } from '@/lib/types';

export default function AddToCartForm({
  product,
  locale,
  // attributeLabels,
}: {
  product: Product;
  locale: string;
  attributeLabels: Record<string, string>;
}) {
  const { addItem } = useCart();
  const { attributeOptions, matchingVariant, selectAttribute } = useProductVariant();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    undefined,
  );
  const colorVariants = useMemo(
    () =>
      product.variants
        .filter((variant) => Boolean(getVariantColorCode(variant.attributes)))
        .filter(
          (variant, index, variants) =>
            variants.findIndex(
              (candidate) =>
                getVariantColorCode(candidate.attributes) ===
                getVariantColorCode(variant.attributes),
            ) === index,
        ),
    [product.variants],
  );

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

  function setSelectedAttribute(variant: Variant) {
    [...attributeOptions.entries()].map(([name]) => {
      const selectedAttribute = variant.attributes.find(attr => attr.name === name)?.value ?? '';
      const selectedValue = selectedAttribute?.key
        ? selectedAttribute?.key
        : getLocalizedString(selectedAttribute, locale);
      selectAttribute(name, selectedValue);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {matchingVariant?.price && (
        <div>
          {matchingVariant.price.discounted ? (
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-red-500">
                {formatMoney(
                  matchingVariant.price.discounted.centAmount,
                  matchingVariant.price.discounted.currencyCode,
                  locale,
                )}
              </p>
              <p className="text-sm text-charcoal-light line-through">
                {formatMoney(
                  matchingVariant.price.centAmount,
                  matchingVariant.price.currencyCode,
                  locale,
                )}
              </p>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-charcoal">
              {formatMoney(
                matchingVariant.price.centAmount,
                matchingVariant.price.currencyCode,
                locale,
              )}
            </p>
          )}
          <p
            className={`mt-2 text-sm ${isUnavailable ? 'text-red-600' : 'text-sage'}`}
          >
            {isUnavailable
              ? 'Currently unavailable'
              : 'In stock and ready to ship'}
          </p>
        </div>
      )}

      {colorVariants.length > 0 && (
        <>
          <label className="mb-2 block text-sm font-medium text-charcoal">
            Color
          </label>
          <div className="flex items-center gap-2">
            {colorVariants.map((variant) => {
                return variant.attributes.length > 0 ? (
                  <button
                    key={variant.id}
                    type="button"
                    data-testid="product-variant"
                    className={`flex items-center justify-center cursor-pointer rounded-full border size-6 ${
                      variant.sku !==
                      (selectedVariant?.sku ?? matchingVariant?.sku)
                        ? 'border-charcoal-light'
                        : 'border-terra'
                    }`}
                    style={{
                      backgroundColor: getVariantColorCode(variant.attributes),
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVariant(variant);
                      setSelectedAttribute(variant);
                    }}
                  >
                    {variant.sku ===
                      (selectedVariant?.sku ?? matchingVariant?.sku) && (
                      <CheckIcon className="size-4" />
                    )}
                  </button>
                ) : null;
              })}
          </div>
        </>
      )}

      <div className="flex items-center justify-between gap-2">
        <QuantitySelector
          value={quantity}
          minValue={1}
          disabled={isUnavailable}
          onChange={setQuantity}
          className="h-11"
        />

        <Button
          type="submit"
          disabled={status === 'loading' || !matchingVariant || isUnavailable}
          size="full"
          variant="primary"
        >
          {status === 'loading'
            ? 'Adding…'
            : isUnavailable
              ? 'Unavailable'
              : 'Add to cart'}
        </Button>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
