'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/atoms/button';
import Image from '@/components/ui/atoms/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Link } from '@/i18n/routing';
import {
  formatAttributeValue,
  humanizeAttributeName,
} from '@/lib/product-attributes';
import { isColorCodeFacet } from '@/lib/search-filters';
import { formatMoney } from '@/lib/utils';
import type { Product } from '@/lib/types';
import {
  clearComparedProducts,
  COMPARE_PRODUCTS_EVENT,
  getComparedProducts,
  removeComparedProduct,
} from '@/lib/compare';

interface CompareProductsProps {
  locale: string;
  labels: Record<string, string>;
}

export default function CompareProducts({
  locale,
  labels,
}: CompareProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const updateProducts = () => setProducts(getComparedProducts(locale));
    updateProducts();
    window.addEventListener(COMPARE_PRODUCTS_EVENT, updateProducts);
    return () =>
      window.removeEventListener(COMPARE_PRODUCTS_EVENT, updateProducts);
  }, [locale]);

  const specificationNames = [
    ...new Set(
      products.flatMap(
        (product) =>
          product.variants[0]?.attributes
            .filter((attribute) => !isColorCodeFacet(attribute.name))
            .map((attribute) => attribute.name) ?? [],
      ),
    ),
  ];

  if (products.length === 0) {
    return (
      <section className="text-center">
        <h1 className="text-3xl font-semibold text-charcoal">
          Compare products
        </h1>
        <p className="mt-3 text-charcoal-light">
          Add products from a product page to compare them here.
        </p>
        <Link
          href="/category/all"
          locale={locale}
          className="inline-block mt-6"
        >
          <Button
            variant="secondary"
            className="py-2!"
          >
            Browse products
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-charcoal">
          Compare products
        </h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-charcoal-light text-sm">
            {products.length} product{products.length === 1 ? '' : 's'} selected
          </p>
          <Button
            variant="secondary"
            className="py-2!"
            onClick={() => clearComparedProducts(locale)}
          >
            Remove all products
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-195 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-44 p-4 font-medium text-charcoal-light">
                Product
              </th>
              {products.map((product) => {
                const variant = product.variants[0];
                return (
                  <th
                    key={product.id}
                    className="border-l border-border min-w-60 p-4 align-top font-normal relative"
                  >
                    <div className="relative aspect-square h-50 w-full bg-white">
                      <Image
                        src={variant?.images[0]}
                        suffix="medium"
                        alt={product.name}
                        className="object-contain"
                        fill
                      />
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      locale={locale}
                      className="mt-4 block text-lg font-semibold text-charcoal hover:text-terra"
                    >
                      {product.name}
                    </Link>
                    {product.brand && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-terra">
                        {product.brand}
                      </p>
                    )}
                    <button
                      type="button"
                      aria-label="Remove product"
                      onClick={() => removeComparedProduct(product.id, locale)}
                      className="absolute bottom-4 right-4 inline-flex items-center text-charcoal hover:text-terra"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow
              label="Brand"
              products={products}
              value={(product) => product.brand ?? '—'}
            />
            <ComparisonRow
              label="Description"
              products={products}
              value={(product) => product.description ?? '—'}
              className="leading-6 text-charcoal-light"
            />
            <ComparisonRow
              label="Price"
              products={products}
              value={(product) => {
                const price = product.variants[0]?.price;
                const activePrice = price?.discounted ?? price;
                return activePrice
                  ? formatMoney(
                      activePrice.centAmount,
                      activePrice.currencyCode,
                      locale,
                    )
                  : '—';
              }}
              className="font-medium text-charcoal"
            />
            {products.some((product) => product.variants[0]?.sku) && (
              <ComparisonRow
                label="SKU"
                products={products}
                value={(product) => product.variants[0]?.sku ?? '—'}
              />
            )}
            {specificationNames.map((name) => (
              <ComparisonRow
                key={name}
                label={labels[name] ?? humanizeAttributeName(name)}
                products={products}
                value={(product) => {
                  const attribute = product.variants[0]?.attributes.find(
                    (item) => item.name === name,
                  );
                  return attribute
                    ? formatAttributeValue(attribute.value, locale)
                    : '—';
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComparisonRow({
  label,
  products,
  value,
  className = '',
}: {
  label: string;
  products: Product[];
  value: (product: Product) => string;
  className?: string;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <th
        scope="row"
        className="bg-cream p-4 font-medium text-charcoal-light"
      >
        {label}
      </th>
      {products.map((product) => (
        <td
          key={product.id}
          className={`border-l border-border p-4 text-charcoal ${className}`}
        >
          {value(product)}
        </td>
      ))}
    </tr>
  );
}
