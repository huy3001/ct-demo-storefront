import React from 'react';
import dynamic from 'next/dynamic';
import HeaderLogo from '@/components/ui/organisms/header/header-logo';
import HeaderNavigationDesktop from '@/components/ui/organisms/header/header-navigation/header-navigation-desktop';
import HeaderNavigationMobile from '@/components/ui/organisms/header/header-navigation/header-navigation-mobile';
import { HeaderProps } from '@/components/ui/organisms/header/types';
import UtilitySection from '@/components/ui/organisms/header/utility-section';

// const AlgoliaSearch = dynamic(() => import('@/components/ui/atoms/search-algolia'));
const CommercetoolsSearch = dynamic(() => import('@/components/ui/atoms/search'));

const Header: React.FC<HeaderProps> = ({
  cart,
  isEmpty,
  onRemoveDiscountCode,
  onApplyDiscountCode,
  totalCartItems,
  totalWishlistItems,
  onRemoveItem,
  onUpdateItem,
  OnMoveToWishlist,
  wishlist,
  onMoveToCart,
  onRemoveFromWishlist,
  onClearWishlist,
  navLinks,
  categories,
  logo,
  logoMobile,
  logoLink,
  logoLinkMobile,
  tiles,
  searchItems,
  onSearchQueryUpdate,
  emptyCartTitle,
  emptyCartSubtitle,
  emptyCartImage,
  emptyCartCategories,
  emptyWishlistTitle,
  emptyWishlistSubtitle,
  emptyWishlistImage,
  emptyWishlistCategories,
  // enableAlgoliaSearch = false,
  // locale,
}) => {
  // const Search = enableAlgoliaSearch ? AlgoliaSearch : CommercetoolsSearch;

  return (
    <header className="relative h-fit w-full border-b-[1.5px] border-neutral-400 bg-white">
      <div
        aria-label="Top"
        className="flex w-full items-center justify-between px-4 md:px-6 lg:px-5 xl:px-12"
      >
        <HeaderNavigationMobile
          logo={logoMobile}
          links={navLinks}
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
          <CommercetoolsSearch
            categories={categories}
            items={searchItems}
            onQueryUpdate={onSearchQueryUpdate}
          />
        </div>

        <UtilitySection
          cart={cart}
          onRemoveDiscountCode={onRemoveDiscountCode}
          onApplyDiscountCode={onApplyDiscountCode}
          isEmpty={isEmpty}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
          OnMoveToWishlist={OnMoveToWishlist}
          wishlist={wishlist}
          onRemoveFromWishlist={onRemoveFromWishlist}
          onMoveToCart={onMoveToCart}
          onClearWishlist={onClearWishlist}
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

      <div className="relative block w-full border-t border-neutral-400 px-4 py-2 md:px-6 lg:px-5 xl:hidden xl:px-12">
        <CommercetoolsSearch
          categories={categories}
          items={searchItems}
          onQueryUpdate={onSearchQueryUpdate}
        />
      </div>

      <HeaderNavigationDesktop
        links={navLinks}
        tiles={tiles ?? []}
      />
    </header>
  );
};

export default Header;
