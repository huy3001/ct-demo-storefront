import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'use-intl';
import HeaderLogo from '@/components/ui/organisms/header/header-logo';
import HeaderNavigationDesktop from '@/components/ui/organisms/header/header-navigation/header-navigation-desktop';
import HeaderNavigationMobile from '@/components/ui/organisms/header/header-navigation/header-navigation-mobile';
import { HeaderProps } from '@/components/ui/organisms/header/types';
import UtilitySection from '@/components/ui/organisms/header/utility-section';
import AnnouncementBar from '@/components/ui/organisms/announcement-bar';

// const AlgoliaSearch = dynamic(() => import('@/components/ui/atoms/search-algolia'));
const CommercetoolsSearch = dynamic(() => import('@/components/ui/atoms/search'));

const Header: React.FC<HeaderProps> = ({
  isEmpty,
  onRemoveDiscountCode,
  totalCartItems,
  totalWishlistItems,
  navLinks,
  logo,
  logoMobile,
  logoLink,
  logoLinkMobile,
  tiles,
  emptyCartTitle,
  emptyCartSubtitle,
  emptyCartImage,
  emptyCartCategories,
  emptyWishlistTitle,
  emptyWishlistSubtitle,
  emptyWishlistImage,
  emptyWishlistCategories,
  // enableAlgoliaSearch = false,
}) => {
  const translate = useTranslations();

  // const Search = enableAlgoliaSearch ? AlgoliaSearch : CommercetoolsSearch;

  const validNavLinks = navLinks.filter(
    (link) => Boolean(link.slug) && link.showInNavigation,
  );

  return (
    <header>
      <div className="pt-37 md:pt-45 xl:pt-42" />
      <div
        id="header-container"
        className="fixed top-0 z-1111 w-full"
      >
        <AnnouncementBar
          text={translate('announcement.explore-collection')}
          highlightedSubstring={translate('announcement.collection')}
          target={{ type: 'link', link: '/category/all' }}
        />

        <div className="relative h-fit w-full border-b border-neutral-400 bg-white">
          <div
            aria-label="Top"
            className="flex w-full items-center justify-between mx-auto max-w-7xl px-4"
          >
            <HeaderNavigationMobile
              logo={logoMobile}
              links={validNavLinks}
              logoLink={logoLinkMobile}
            />

            <div className="ml-0 flex w-full justify-start lg:ml-5 xl:ml-0 xl:w-fit">
              <HeaderLogo
                logo={logo}
                logoLink={logoLink}
                imageClassName="flex h-11 w-47 justify-center text-center text-base font-bold md:h-19 md:w-53.5 md:text-2xl"
              />
            </div>

            <div className="relative hidden w-full px-4 py-3 md:px-8 lg:px-5 xl:block xl:px-15">
              <CommercetoolsSearch />
            </div>

            <UtilitySection
              onRemoveDiscountCode={onRemoveDiscountCode}
              isEmpty={isEmpty}
              totalCartItems={totalCartItems}
              totalWishlistItems={totalWishlistItems}
              emptyCartTitle={emptyCartTitle}
              emptyCartSubtitle={emptyCartSubtitle}
              emptyCartImage={emptyCartImage}
              emptyCartCategories={emptyCartCategories}
              emptyWishlistTitle={emptyWishlistTitle}
              emptyWishlistSubtitle={emptyWishlistSubtitle}
              emptyWishlistImage={emptyWishlistImage}
              emptyWishlistCategories={emptyWishlistCategories}
            />
          </div>

          <div className="relative block w-full border-t border-neutral-400 px-4 py-2 xl:hidden">
            <CommercetoolsSearch />
          </div>

          <HeaderNavigationDesktop
            links={validNavLinks}
            tiles={tiles ?? []}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
