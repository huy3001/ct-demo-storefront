import { FC } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import useClassNames from '@/hooks/useClassNames';
import { Money } from '@/types/entity/product';

type AccordionButtonProps = {
  open: boolean;
  toggleAccordion: () => void;
  total: Required<Money>;
  className?: string;
};

const AccordionButton: FC<AccordionButtonProps> = ({ open, toggleAccordion, className }) => {
  const translate = useTranslations();

  const accordionContentClassNames = useClassNames(['flex w-full justify-between py-4', className]);

  const arrowClassNames = useClassNames([open ? 'rotate-180 transform' : '', 'transition text-gray-600']);

  return (
    <div>
      <div className={accordionContentClassNames} onClick={toggleAccordion}>
        <p className="text-gray-600">{translate('orders.your-order')}</p>

        <div className="flex">
          <ChevronDownIcon width={17.5} strokeWidth={1} className={arrowClassNames} />
        </div>
      </div>
    </div>
  );
};

export default AccordionButton;
