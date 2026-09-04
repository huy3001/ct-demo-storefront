import React, { FC } from 'react';
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import { ImageProps } from '@/components/ui/atoms/image';
import HeaderLogo from '@/components/ui/organisms/header/header-logo';
import { Category } from '@/types/entity/category';
import { Reference } from '@/types/reference';

export interface Props {
  logo: ImageProps;
  logoLink: Reference;
  categories: Category[];
  onArrowClick: () => void;
  hideHeaderMenu: () => void;
}

const MobileMenuHeader: FC<Props> = ({ onArrowClick, logo, logoLink, hideHeaderMenu, categories }) => {
  const translate = useTranslations();
  return (
    <div className="flex h-13 w-full justify-between border-b border-neutral-400 px-5">
      {categories.length > 0 && (
        <div className="flex h-full items-center justify-start">
          <Button variant="ghost" size="fit" onClick={onArrowClick} className="px-0">
            <ChevronLeftIcon className="w-5 text-gray-600" />
          </Button>
        </div>
      )}
      {categories.length <= 0 ? (
        <HeaderLogo
          logo={logo}
          logoLink={logoLink}
          onClick={hideHeaderMenu}
          imageClassName="flex h-full w-40 justify-center text-center text-base font-bold md:text-2xl"
        />
      ) : (
        <div className="flex w-full items-center justify-center whitespace-nowrap">
          <p className="text-center font-medium">{categories[categories.length - 1].name}</p>
        </div>
      )}
      <div className="flex h-full items-center justify-end">
        <Button variant="ghost" size="xs" onClick={hideHeaderMenu} title={translate('common.close')} className="px-0">
          <XMarkIcon className="w-6 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default MobileMenuHeader;
