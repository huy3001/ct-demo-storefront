'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';
import { emptyImage } from '@/helpers/mocks/mockHeaderData';
import { EmptyState } from '@/components/ui/organisms/empty-state';
import { Link as CategoryLink } from '@/components/ui/organisms/header/types';
import CartItem from '@/components/ui/organisms/cart/components/cart-item';
import OrderSummary from '@/components/ui/organisms/order-summary';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';

export default function CartPage() {
  const { locale } = useParams<{ locale: string }>();
  const { cart, isLoading, clearCart } = useCart();
  const [cartStatus, setCartStatus] = useState<'idle' | 'updating' | 'error'>(
    'idle',
  );

  const emptyStateCategories: CategoryLink[] = [
    {
      name: 'All Products',
      reference: {
        link: '/category/all',
        type: 'link',
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-charcoal-light">
        Loading cart…
      </div>
    );
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="py-12 text-center">
          <h1 className="text-xl font-semibold md:text-2xl">
            Your cart is empty
          </h1>

          <EmptyState
            className="grow"
            categories={emptyStateCategories}
            image={emptyImage}
            title={''}
            subtitle={'Continue shopping'}
            handleCategoryClick={() => {}}
            imageClassName="md:h-50 md:w-100"
          />
        </div>

        <RecentlyViewedProducts locale={locale} />
      </div>
    );
  }

  async function onClearCart() {
    setCartStatus('updating');
    try {
      await clearCart();
      setCartStatus('idle');
    } catch {
      setCartStatus('error');
    }
  }

  const discountCodes = cart?.discountCodes
    ?.map((discount) => discount.discountCode?.obj)
    .filter(
      (discount): discount is NonNullable<typeof discount> =>
        discount !== undefined,
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <button
          type="button"
          onClick={onClearCart}
          disabled={cartStatus === 'updating'}
          className="text-sm text-charcoal-light hover:text-red-600 disabled:opacity-60"
        >
          Clear all
        </button>
      </div>

      {cartStatus === 'error' && (
        <p className="mb-4 text-sm text-red-600">Unable to update your cart.</p>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <ul className="divide-y divide-border">
            {cart.lineItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
              />
            ))}
          </ul>
        </div>

        <aside className="rounded-sm border border-border bg-white p-6 lg:sticky lg:top-24">
          <OrderSummary
            cart={cart}
            className="p-0!"
            title={'Order summary'}
            includeSummaryAccordion
            discounts={discountCodes ?? []}
            order={cart}
          />

          <Link
            href="/checkout"
            locale={locale}
            className="mt-6 block rounded-sm bg-charcoal py-3 text-center text-sm text-white hover:bg-charcoal-light"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>

      <RecentlyViewedProducts locale={locale} />
    </div>
  );
}
