import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import Input from '@/components/ui/atoms/input';
import useResolveCCImage from '@/components/ui/organisms/checkout/hooks/useResolveCCImage';
import useHash from '@/hooks/useHash';
import { useRouter } from '@/i18n/routing';
import useEditPaymentMethods from '../helper-hooks/useEditPaymentMethod';
import useCardNumberFormatter from '../helper-hooks/useFormatCredit';
import usePaymentHelpers from '../helper-hooks/usePaymentHelpers';
import PaymentDelete from '../payment-delete';

const PaymentEdit = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, hashId] = useHash();
  const router = useRouter();

  const id = hashId?.split('-')[1];

  const translate = useTranslations();
  const paymentEditData = useEditPaymentMethods(id as string);

  const { expiryDateMonthOptions, expiryDateYearOptions } = usePaymentHelpers();

  const cardNumberFormatted = useCardNumberFormatter(paymentEditData.cardNumber ?? '');

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const resolveCCImage = useResolveCCImage();

  return (
    <div className="ml-0 md:ml-24 lg:ml-44">
      <div className="ml-16 mt-24 lg:ml-0 lg:mt-40">
        <h2 className="text-18 text-primary md:text-22 lg:text-24">{translate('payment.edit-payment')}</h2>
      </div>

      <PaymentDelete
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        handleCancelClick={closeModal}
        handleDeleteClick={paymentEditData.handleDeleteClick}
      />

      <div className="mt-0 w-full px-16 py-0 lg:mt-36 lg:w-[65%] lg:rounded-md lg:border lg:px-24 lg:py-32">
        <div className="mt-24 md:max-w-109 lg:mt-0">
          <div className="relative">
            <label className="text-14 font-medium text-gray-600">{translate('payment.card-number')}</label>
            <Input
              value={cardNumberFormatted}
              className="mt-8 sm:px-8"
              labelPosition="inline"
              type="text"
              onChange={paymentEditData.handleCardNumberChange}
              errorMessage={translate('payment.card-number-error')}
            />
            {resolveCCImage(cardNumberFormatted) && (
              // eslint-disable-next-line
              <img
                className="absolute right-8 top-52 w-32 -translate-y-1/2"
                src={resolveCCImage(cardNumberFormatted)}
              />
            )}
          </div>

          <div className="mt-24 w-full flex-col gap-8 md:max-w-109 lg:mt-12 lg:flex lg:flex-row">
            <div className="w-full lg:w-3/5">
              <label className="text-14 font-medium text-gray-600">{translate('payment.expiration-date')}</label>
              <div className="mt-8 flex grow items-center md:flex-1">
                <div className="mr-12">
                  <Dropdown
                    selectDefaultValue={paymentEditData.cardExpMonthDate}
                    selectOptions={expiryDateMonthOptions.slice(1)}
                    selectOnChange={paymentEditData.handleExpiryDateMonthChange}
                  />
                </div>
                /
                <div className="ml-12">
                  <Dropdown
                    selectDefaultValue={paymentEditData.cardExpYearDate}
                    selectOptions={expiryDateYearOptions.slice(1)}
                    selectOnChange={paymentEditData.handleExpiryDateYearChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 flex-col justify-start lg:mt-32 lg:flex lg:max-w-109 lg:flex-row lg:justify-between">
          <Button variant="ghost" size="fit" className="flex items-center px-0" onClick={() => setModalIsOpen(true)}>
            <TrashIcon className="w-20 text-gray-600" />
            <span className="ml-8 text-center text-14 font-normal text-gray-600">{translate('payment.delete')}</span>
          </Button>

          <div className="mt-32 flex lg:mt-0">
            <Button variant="secondary" className="ml-0 w-28 lg:ml-64" onClick={() => router.push('/account#payment')}>
              <span className="text-center text-14 text-primary">{translate('payment.cancel')}</span>
            </Button>

            <Button variant="primary" className="ml-12 w-28" onClick={paymentEditData.handleSaveClick}>
              <span className="text-center text-14">{translate('payment.save')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentEdit;
