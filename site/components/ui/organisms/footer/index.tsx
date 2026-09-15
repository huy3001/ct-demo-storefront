import React from 'react';
import Accordion from '@/components/ui/atoms/accordion';
import { ImageProps } from '@/components/ui/atoms/image';
import { Reference } from '@/types/reference';
import Column, { FooterLink } from './atoms/column';
import FooterBottom from './footer-bottom';

export interface FooterColumn {
  header?: string;
  links?: FooterLink[];
}
export interface Props {
  columns: FooterColumn[];
  logo?: ImageProps;
  socialMedia?: SocialMedia[];
  locale?: string;
}

export interface SocialMedia {
  title?: string;
  logo: ImageProps;
  reference: Reference;
}

const Footer: React.FC<Props> = ({ columns, logo, socialMedia, locale }) => {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="w-full bg-charcoal"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="hidden w-full justify-between py-10 md:flex">
          <div className="grid w-full grid-cols-4 lg:gap-10 xl:gap-20">
            {columns?.map((column, index) => (
              <div key={index}>
                <Column
                  header={column.header}
                  links={column.links ?? []}
                  className="flex flex-col items-center lg:items-start"
                />
              </div>
            ))}
          </div>
        </div>

        <ul className="flex flex-col md:hidden">
          {columns?.map((column, index) => (
            <li
              key={index}
              className="border-b border-neutral-300"
            >
              <Accordion
                variant="arrow"
                closedSectionTitle={column.header ?? ''}
                openSectionTitle={column.header}
                buttonClassName="h-12 text-sm font-medium text-white px-3 text-neutral-150"
                iconClassName="text-neutral"
              >
                <div
                  className="mb-4 ml-5 flex flex-row text-sm md:ml-6"
                  key={index}
                >
                  <Column
                    links={column.links ?? []}
                    className="px-0"
                  />
                </div>
              </Accordion>
            </li>
          ))}
        </ul>
        <div className="w-full sm:border-t-accent" />
        <FooterBottom
          socialMedia={socialMedia}
          logo={logo}
          locale={locale}
        />
      </div>
    </footer>
  );
};

export default Footer;
