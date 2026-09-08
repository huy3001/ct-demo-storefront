import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslations } from 'use-intl';
import AccordionBtn, { AccordionProps } from '@/components/ui/atoms/accordion';
import CloseIcon from '@/components/icons/close';
import useClassNames from '@/hooks/useClassNames';
// import { DiscountCode } from '@/types/entity/cart';
import type { DiscountCodeInfo as DiscountCode } from '@commercetools/platform-sdk';

export interface Props {
  className?: string;
  accordionProps?: AccordionProps;
  discounts: DiscountCode[];
  onApplyDiscountCode?: (code: string) => Promise<void>;
  onRemoveDiscountCode?: (discount: DiscountCode) => Promise<void>;
}

type UserInput = {
  code: string;
};

const DiscountForm: React.FC<Props> = ({
  className,
  accordionProps,
  discounts,
  onApplyDiscountCode,
  onRemoveDiscountCode,
}) => {
  const translate = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<UserInput>({ defaultValues: { code: '' } });

  const inputClassName = useClassNames([
    'h-10 w-full border rounded-sm px-2.5 py-3 text-sm placeholder:text-gray-600 disabled:bg-neutral-300 focus:outline-none',
    errors.code ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-neutral-300',
  ]);

  const discountsContainerClassName = useClassNames([
    'mt-2 flex flex-wrap justify-items-start gap-3',
    discounts?.length === 0 ? 'pt-0' : 'pt-1',
  ]);

  const containerClassName = useClassNames(['py-4 border-t border-neutral-400 text-sm', className]);

  const onApplyDiscount: SubmitHandler<UserInput> = ({ code }) => {
    if (isSubmitting || !code) return;

    onApplyDiscountCode?.(code)
      .then(() => reset())
      .catch((err: Error) => {
        if (err.message.includes('MaxApplicationReached')) {
          setError('code', {
            type: 'custom',
            message: translate('cart.voucher-max-usage-singular'),
          });
        } else {
          setError('code', {
            type: 'custom',
            message: translate('cart.codeNotValid'),
          });
        }
      });
  };

  const handleRemove = (discount: DiscountCode) => {
    onRemoveDiscountCode?.(discount);
  };

  return (
    <div className={containerClassName}>
      <AccordionBtn
        closedSectionTitle={translate('cart.discount-apply')}
        buttonClassName="text-gray-600 "
        {...accordionProps}
      >
        <div>
          <form className="mt-6" onSubmit={handleSubmit(onApplyDiscount)}>
            <div className="relative">
              <input
                className={inputClassName}
                placeholder={translate('cart.cart-discount-enter')}
                disabled={isSubmitting}
                {...register('code')}
              />
              {errors.code && (
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  <CloseIcon className="size-2.5 cursor-pointer" />
                </span>
              )}
            </div>
            {errors.code && (
              <p className="mt-4 font-body text-xs font-medium leading-normal text-red-500">{errors.code?.message}</p>
            )}
          </form>

          {discounts && !!discounts.length && (
            <div className={discountsContainerClassName}>
              {discounts.map((discount) => (
                <div
                  key={discount.discountCodeId}
                  className="mr-0.5 flex w-fit justify-between gap-2 rounded-sm border border-neutral-400 bg-white px-2 py-1"
                >
                  <label className="text-xs uppercase leading-4 text-gray-600">{discount.code}</label>
                  <button type="button" onClick={() => handleRemove(discount)}>
                    <XMarkIcon className="size-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AccordionBtn>
    </div>
  );
};

export default DiscountForm;
