import React, { FC } from 'react';
import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import MobileMenuNavButton from '../atoms/menu-nav-button';
import type { Category } from '@/lib/types';

export interface Props {
  links: Category[];
  hideHeaderMenu: () => void;
  categoriesNavigator?: Category[]; //This is a navigator where you push a descendant to show it's contents
  insertCategory: (category: Category) => void;
}

const MobileMenu: FC<Props> = ({ links, categoriesNavigator, insertCategory, hideHeaderMenu }) => {
  const translate = useTranslations();

  const getLinkUrl = (link: Category) => {
    return `/category/${link.slug}`;
  };

  return (
    <div className="ml-6 mr-5.5">
      {categoriesNavigator && categoriesNavigator?.length > 0 && (
        <div className="pt-6">
          {categoriesNavigator[categoriesNavigator.length - 1]?.id != 'myAccount' && (
            <div className="pb-9" onClick={hideHeaderMenu}>
              <Link
                link={
                  getLinkUrl(categoriesNavigator[categoriesNavigator.length - 1])
                }
              >
                <p className="text-primary">{translate('common.view-all')}</p>
              </Link>
            </div>
          )}
        </div>
      )}
      {categoriesNavigator && categoriesNavigator.length <= 0 ? (
        links?.map((link) => (
          <MobileMenuNavButton
            key={link.id}
            categoriesNavigator={categoriesNavigator}
            link={link}
            onClick={() => insertCategory(link)}
            hideHeaderMenu={hideHeaderMenu}
          />
        ))
      ) : (
        <>
          {categoriesNavigator &&
            categoriesNavigator[categoriesNavigator.length - 1].children?.map((nav) => (
              <MobileMenuNavButton
                key={nav.id}
                categoriesNavigator={categoriesNavigator}
                link={nav}
                onClick={() => insertCategory(nav)}
                hideHeaderMenu={hideHeaderMenu}
              />
            ))}
        </>
      )}
    </div>
  );
};

export default MobileMenu;
