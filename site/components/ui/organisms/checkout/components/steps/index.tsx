import Button from '@/components/ui/atoms/button';
import { CartDetails } from '@/types/cart/Cart';
import usePath from '@/hooks/usePath';
import { classnames } from '@/helpers/utils/classnames';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShippingMethod } from '@/types/entity/cart';
import { useTranslations } from 'use-intl';
import { useCheckout } from '../../provider';
import Step from '../step';
import AddressesPreview from './previews/addresses';
import PaymentPreview from './previews/payment';
import ShippingPreview from './previews/shipping';
import Addresses from './sections/addresses';
import CommercetoolsPayment from './sections/ct-payment';
import Payment from './sections/payment';
import Shipping from './sections/shipping';
import type { Cart } from '@commercetools/platform-sdk';

interface Props {
  cart?: Cart;
  isCtPaymentOnly?: boolean;
  shippingMethods: ShippingMethod[];
  onUpdateCart?: (payload: CartDetails) => Promise<Cart>;
  hasOutOfStockItems?: boolean;
  onPurchase: () => void;
  onFinalStepChange: (isFinalStep: boolean) => void;
  callbackUrl?: string;
}

const Steps: React.FC<Props> = ({
  cart,
  isCtPaymentOnly,
  shippingMethods,
  hasOutOfStockItems,
  onUpdateCart,
  onPurchase,
  onFinalStepChange,
  callbackUrl,
}) => {
  const translate = useTranslations();

  const router = useRouter();

  const searchParams = useSearchParams();

  const step = +(searchParams.get('step') ?? 0);

  const { pathWithoutQuery } = usePath();

  const { processing, setProcessing } = useCheckout();

  const active = step;
  const [peakActive, setPeakActive] = useState(() => Math.min(step, 2));

  const goToNextStep = useCallback(() => {
    setPeakActive(Math.max(peakActive, active + 1));
    router.push(`${pathWithoutQuery}?step=${active + 1}`, { scroll: false });
  }, [active, peakActive, router, pathWithoutQuery]);

  const goToReview = useCallback(() => {
    router.push(`${pathWithoutQuery}?step=${peakActive}`, { scroll: false });
  }, [pathWithoutQuery, peakActive, router]);

  const onEdit = useCallback(
    (index: number) =>
      router.push(`${pathWithoutQuery}?step=${index}`, { scroll: false }),
    [pathWithoutQuery, router],
  );

  const steps = useMemo(() => {
    return [
      {
        label: translate('cart.addresses'),
        Component: (
          <Addresses
            cart={cart}
            isCompleted={peakActive > 0}
            onUpdateCart={onUpdateCart}
            goToNextStep={goToNextStep}
            goToReview={goToReview}
          />
        ),
        Preview: <AddressesPreview cart={cart} />,
      },
      {
        label: translate('cart.shipping'),
        Component: <Shipping goToNextStep={goToNextStep} />,
        Preview: (
          <ShippingPreview
            cart={cart}
            shippingMethods={shippingMethods}
          />
        ),
      },
      ...[
        !isCtPaymentOnly
          ? {
              label: translate('cart.payment'),
              Component: <Payment goToNextStep={goToNextStep} />,
              Preview: <PaymentPreview />,
            }
          : {
              label: translate('cart.payment'),
              Component: (
                <CommercetoolsPayment
                  isActive={active === 2}
                  isCompleted={peakActive > 2}
                  setCheckoutIsProcessing={setProcessing}
                  goToNextStep={goToNextStep}
                  onCompletePayment={async () => {}}
                  hasOutOfStockItems={hasOutOfStockItems}
                  callbackUrl={callbackUrl}
                />
              ),
            },
      ],
    ];
  }, [
    translate,
    cart,
    peakActive,
    onUpdateCart,
    goToNextStep,
    goToReview,
    shippingMethods,
    isCtPaymentOnly,
    active,
    setProcessing,
    hasOutOfStockItems,
    callbackUrl,
  ]);

  const isFinalStep = useMemo(
    () => active === steps.length,
    [active, steps.length],
  );

  useEffect(() => {
    onFinalStepChange(isFinalStep);
  }, [isFinalStep, onFinalStepChange]);

  useEffect(() => {
    // this effect basically pushes the user back if it sees that the step is > 2
    // it only runs on load
    // So users would always have to add payment data again in case they reload/revisit page after it's been added
    if (step > 2) {
      router.push(`${pathWithoutQuery}?step=2`, { scroll: false });
    }
  }, [pathWithoutQuery, router, step]);

  return (
    <div className="lg:grow">
      <div className="flex flex-col gap-24 lg:bg-neutral-200">
        {steps.map(({ Component, Preview, label }, index) => (
          <Step
            key={index}
            label={label}
            number={index + 1}
            isExpanded={index === active}
            isCompleted={index < peakActive}
            onEdit={() => onEdit(index)}
            Component={Component}
            Preview={Preview}
          />
        ))}
      </div>
      <div className={classnames('mt-24 lg:hidden', { hidden: !isFinalStep })}>
        <Button
          variant="primary"
          className="w-full"
          type="submit"
          loading={processing}
          disabled={hasOutOfStockItems}
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
      </div>
    </div>
  );
};

export default Steps;
