import React, { FC, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Accordion from '@/components/ui/atoms/accordion';
import Image from '@/components/ui/atoms/image';
import useClassNames from '@/hooks/useClassNames';
import useI18n from '@/hooks/useI18n';
import mapCosts from '@/helpers/utils/mapCosts';
import { Order } from '@/types/entity/order';
import AccordionButton from './accordion-button';
import { formatMoney, getLocalizedString } from '@/lib/utils';
import type { Cart } from '@commercetools/platform-sdk';

export interface Props {
  className?: string;
  order?: Order;
  cart?: Cart;
}

const SummaryAccordion: FC<Props> = ({ className, order, cart }) => {
  const data = { ...(order ?? cart) } as Cart;

  const { locale } = useParams();
  const { currency } = useI18n();

  const [open, setOpen] = useState(false);

  const accordionClassNames = useClassNames(['block', className]);

  const toggleAccordion = () => setOpen(!open);

  const lineItemClassNames = (index: number) => {
    return `
      flex justify-between items-center py-4
      ${data?.lineItems && index === data.lineItems.length - 1 ? '' : 'border-b border-neutral-400'}`;
  };

  const total = useMemo(
    () => (order ? mapCosts({ cart: order, currency }).total : mapCosts({ cart, currency }).total),
    [cart, currency, order],
  );

  return (
    <Accordion
      className={accordionClassNames}
      buttonClassName="w-full"
      customClosedButton={<AccordionButton open={open} toggleAccordion={toggleAccordion} total={total} className="text-sm" />}
    >
      <div className="grid max-h-100 w-full grid-cols-1 overflow-auto">
        {data?.lineItems?.map((lineItem, index) => (
          <div key={lineItem.id} className={lineItemClassNames(index)}>
            <div className="flex items-center justify-start">
              {lineItem.variant?.images?.[0] && (
                <div className="relative h-20 w-20 shrink-0">
                  <Image
                    fill
                    src={lineItem.variant.images[0].url}
                    style={{ objectFit: 'contain' }}
                    alt={getLocalizedString(lineItem?.name, locale) ?? ''}
                  />
                </div>
              )}
              <div className="flex flex-col justify-center gap-2 pl-4">
                <p className="text-sm font-semibold text-gray-700">{getLocalizedString(lineItem?.name, locale)}</p>
                <p className="text-sm text-gray-600">
                  {formatMoney(lineItem?.price?.value?.centAmount ?? 0, lineItem?.price?.value?.currencyCode ?? 'USD', locale)}
                </p>
                <p className="text-sm text-gray-400">{`x ${lineItem?.quantity}`}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Accordion>
  );
};

export default SummaryAccordion;
