import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import OrderItemsListing from '@/components/ui/organisms/order-items-listing';
import OrderPaymentSection from '@/components/ui/organisms/order-payment-section';
import DiscountForm from '@/components/ui/organisms/order-payment-section/components/discount-form';
import useCart from '@/frontastic/hooks/useCart';
import { useCheckout } from '../../provider';

interface Props {
  isFinalStep: boolean;
  onPurchase: () => void;
  isCtPaymentOnly?: boolean;
}

const Summary: React.FC<Props> = ({ isFinalStep, onPurchase, isCtPaymentOnly }) => {
  const translate = useTranslations();

  const accordionRef = useRef<HTMLDivElement>(null);

  const { data } = useCart();

  const { processing } = useCheckout();

  useEffect(() => {
    if (isFinalStep && accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isFinalStep]);

  return (
    <div className="bg-white lg:mt-0 lg:min-w-[35%] lg:p-36">
      <h3 className="p-16 leading-5.5 text-primary md:p-24 md:text-18 lg:px-0 lg:pt-0">
        {translate('cart.order-summary')}
      </h3>

      {data?.lineItems && <OrderItemsListing className="border-t border-neutral-400" lineItems={data?.lineItems} />}

      <OrderPaymentSection
        discounts={[]}
        onRemoveDiscountCode={async () => {}}
        className="mt-16 hidden bg-white py-16 pb-24 text-16 lg:block lg:pb-0"
        classNames={{
          applyDiscountButton: 'py-14 text-16',
          totalAmount: 'text-18 md:pb-20',
          subCostsContainer: 'pt-12 md:pt-16 mb-20 lg:py-24 lg:mb-16 lg:border-b border-neutral-400',
        }}
        button={
          <Button
            variant="primary"
            disabled={!isFinalStep}
            className="w-full"
            type="submit"
            loading={processing}
            {...(isCtPaymentOnly
              ? {
                  'data-ctc-selector': 'paymentButton',
                }
              : {
                  onClick: onPurchase,
                })}
          >
            {translate('cart.complete-purchase')}
          </Button>
        }
      />

      <DiscountForm
        discounts={[]}
        onRemoveDiscountCode={async () => {}}
        className="border-transparent lg:hidden"
        accordionProps={{
          closedSectionTitle: translate('checkout.discount-apply'),
          buttonClassName: 'text-gray-600 border-b border-neutral-400 pb-16',
          buttonWrapperClassName: 'px-16 md:px-24 lg:px-0',
          panelClassName: 'px-16 md:px-24 lg:px-0',
          iconClassName: 'w-24',
        }}
      />
    </div>
  );
};

export default Summary;
