'use client';

import { TruckIcon } from '@heroicons/react/24/outline';
import { ShippingMethod } from '@/types/cart/ShippingMethod';
import { useTranslations } from 'use-intl';
import { classnames } from '@/helpers/utils/classnames';

const ShippingSection = ({ shippingMethods }: { shippingMethods?: ShippingMethod[] }) => {
  const translate = useTranslations();

  return (
    <div className="mt-6 grid gap-3">
      <p className="text-sm font-medium text-charcoal">
        {translate('checkout.shippingMethods')}
      </p>
      <div className="overflow-hidden rounded-sm border border-neutral-400">
        {(shippingMethods ?? []).map(({ name, description }, index) => (
          <div
            className={classnames('flex items-center gap-5 p-4', {
              'border-t border-neutral-400': index > 0,
            })}
            key={index}
          >
            <TruckIcon
              width={24}
              height={24}
            />
            <div className="grid gap-2">
              {/* Label & Price */}
              <div className="flex flex-wrap gap-4">
                <p className="text-sm font-semibold leading-tight text-charcoal">
                  {description}
                </p>
              </div>

              {/* Est. delivery date */}
              <div>
                <p className="text-sm leading-tight text-charcoal-light">
                  {name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-charcoal-light">
        Available methods and shipping costs are calculated at checkout.
      </p>
    </div>
  );
};

export default ShippingSection;
