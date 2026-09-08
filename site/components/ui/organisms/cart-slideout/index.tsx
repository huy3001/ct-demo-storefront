import { FC } from 'react';
import { useTranslations } from 'use-intl';
import useCloseFlyouts from '@/hooks/useCloseFlyouts';
import { CartSlideoutProps } from './type';
import CartItem from '../cart/components/cart-item';
import { EmptyState } from '../empty-state';
import OrderPaymentSection from '../order-payment-section';
import CheckoutButton from '../order-summary/components/checkout-button';
import { useCart } from '@/hooks/useCart';

const CartSlideout: FC<CartSlideoutProps> = ({
  isEmpty,
  onApplyDiscountCode,
  onRemoveDiscountCode,
  emptyStateImage,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyStateCategories,
  handleCategoryClick,
}) => {
  const translate = useTranslations();

  const closeFlyouts = useCloseFlyouts();

  const { cart } = useCart();

  return (
    <>
      {isEmpty ? (
        <EmptyState
          className="grow"
          categories={emptyStateCategories}
          image={emptyStateImage}
          title={emptyStateTitle}
          subtitle={emptyStateSubtitle}
          handleCategoryClick={handleCategoryClick}
        />
      ) : (
        <div className="h-[65vh] grow divide-y divide-neutral-400 overflow-auto px-3 md:px-5.5">
          {cart?.lineItems?.map((lineItem) => (
            <CartItem
              key={lineItem.id}
              item={lineItem}
            />
          ))}
        </div>
      )}
      <OrderPaymentSection
        discounts={cart?.discountCodes ?? []}
        onApplyDiscountCode={onApplyDiscountCode}
        onRemoveDiscountCode={onRemoveDiscountCode}
        isEmpty={isEmpty}
        classNames={{
          applyDiscountButton: 'px-3 py-6 md:px-5.5',
          infoContainer: 'px-3 p-4 md:px-5.5',
          totalAmount: 'pb-5',
          subCost: 'text-sm',
        }}
        button={
          <CheckoutButton
            disabled={isEmpty}
            text={translate('cart.cart-go')}
            link="/cart"
            onClick={closeFlyouts}
          />
        }
      />
    </>
  );
};

export default CartSlideout;
