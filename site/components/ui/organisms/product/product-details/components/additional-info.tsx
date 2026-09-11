import { FC } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'use-intl';
import AccordionBtn from '@/components/ui/atoms/accordion';

const Markdown = dynamic(() => import('@/components/ui/organisms/markdown'));

type AdditionalInfoProps = {
  productspec?: string;
  description?: string;
};

const AdditionalInfo: FC<AdditionalInfoProps> = ({ productspec, description }) => {
  const translate = useTranslations();

  return (
    <div className="additional-info col-span-2">
      <style>
        {`
        .additional-info ul {
          padding: 0 !important;
          list-style: inside circle;
        }

        .additional-info li {
          --tw-text-opacity: 1;
          color: rgb(33 33 33 / var(--tw-text-opacity));
          line-height: 150%;
          font-weight: 400;
          font-size: 14px;
          font-family: Inter, sans-serif;
      `}
      </style>

      {description && (
        <AccordionBtn
          className="col-span-2 mt-6 border-y border-neutral-400 md:mt-0"
          closedSectionTitle={translate('product.product-desc')}
          buttonClassName="py-5 font-body text-base leading-tight text-primary pl-0 md:pr-3"
          panelClassName="pb-5 md:pt-2.5 md:pb-7.5 text-primary"
        >
          <p
            className="font-body text-sm font-regular leading-loose text-primary"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </AccordionBtn>
      )}
      {productspec && (
        <AccordionBtn
          className="col-span-2 border-b border-neutral-400 md:mt-0"
          closedSectionTitle={translate('product.details-additional')}
          buttonClassName="py-5 font-body text-base leading-tight text-primary pl-0 md:pr-3"
          panelClassName="pb-5 md:pt-2.5 md:pb-7.5 text-primary"
        >
          <Markdown
            className="block font-body text-sm font-regular leading-loose text-primary"
            markdown={productspec}
          />
        </AccordionBtn>
      )}
    </div>
  );
};

export default AdditionalInfo;
