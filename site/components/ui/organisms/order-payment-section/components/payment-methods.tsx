import { FC } from 'react';
import { useTranslations } from 'use-intl';
import Image from '@/components/ui/atoms/image';
import { PaymentMethodsProps } from '../types';

const PaymentMethods: FC<PaymentMethodsProps> = ({ paymentMethods }) => {
  const translate = useTranslations();

  return (
    <div className="mt-5 md:mt-6 lg:mt-4">
      <div className="hidden lg:block">
        <p className="text-sm leading-5 text-gray-600">{translate('cart.we-accept')}</p>
      </div>
      <div className="mt-6.5 flex items-center justify-start gap-3.5 md:justify-center lg:mt-4 lg:justify-start">
        {paymentMethods.map(({ name, image }) => (
          <div key={name} className="relative size-7.5">
            <Image {...image} alt={name} fill style={{ objectFit: 'contain' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
