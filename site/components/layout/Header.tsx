'use client';

// import { Link } from '@/i18n/routing';
// import { useAccount } from '@/hooks/useAccount';
// import { useWishlist } from '@/hooks/useWishlist';
// import CategoryNavigation from '@/components/layout/CategoryNavigation';
import type { Category } from '@/lib/types';
// import MiniCart from '@/components/cart/MiniCart';
// import SearchForm from '@/components/search/SearchForm';
import Header from '@/components/ui/organisms/header';
import { linkReferenceOne } from '@/helpers/mocks/mockCommonData';
import { links, logo, tiles } from '@/helpers/mocks/mockHeaderData';

export default function HeaderContainer({ locale }: { locale: string; categoryTree: Category[] }) {
  // const { isSignedIn } = useAccount();
  // const { totalItems: wishlistCount } = useWishlist();
  return (
    <Header
      onRemoveItem={async () => {}}
      onUpdateItem={async () => {}}
      OnMoveToWishlist={async () => {}}
      navLinks={links}
      logo={logo}
      categories={links}
      logoMobile={logo}
      logoLink={linkReferenceOne}
      logoLinkMobile={linkReferenceOne}
      emptyCartTitle={''}
      emptyCartSubtitle={''}
      emptyCartImage={logo}
      emptyCartCategories={[]}
      emptyWishlistTitle={''}
      emptyWishlistSubtitle={''}
      emptyWishlistImage={logo}
      emptyWishlistCategories={[]}
      tiles={tiles}
      searchItems={[]}
      locale={locale}
    />
    // <header className="border-b border-border bg-cream sticky top-0 z-40">
    //   <div className="mx-auto max-w-7xl px-4 py-3">
    //     <div className="flex items-center gap-3 md:gap-6">
    //       <Link
    //         href="/"
    //         locale={locale}
    //         className="text-xl font-semibold tracking-tight text-charcoal shrink-0 order-1 md:order-0"
    //       >
    //         Deco Store
    //       </Link>

    //       <CategoryNavigation
    //         locale={locale}
    //         categoryTree={categoryTree}
    //       />

    //       <SearchForm locale={locale} className="hidden max-w-md flex-1 md:block" />

    //       <div className="ml-auto flex items-center gap-4 shrink-0 text-sm order-2">
    //         <Link
    //           href={isSignedIn ? '/account' : '/login'}
    //           locale={locale}
    //           className="hover:text-terra"
    //           aria-label={isSignedIn ? 'Account' : 'Sign in'}
    //         >
    //           <span aria-hidden="true">
    //             {isSignedIn ? (
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="20"
    //                 height="20"
    //                 viewBox="0 0 24 24"
    //                 fill="none"
    //                 stroke="currentColor"
    //                 strokeWidth="2"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 className="lucide lucide-user-round-check-icon lucide-user-round-check"
    //               >
    //                 <path d="M2 21a8 8 0 0 1 13.292-6" />
    //                 <circle
    //                   cx="10"
    //                   cy="8"
    //                   r="5"
    //                 />
    //                 <path d="m16 19 2 2 4-4" />
    //               </svg>
    //             ) : (
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="20"
    //                 height="20"
    //                 viewBox="0 0 24 24"
    //                 fill="none"
    //                 stroke="currentColor"
    //                 strokeWidth="2"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 className="lucide lucide-user-round-icon lucide-user-round"
    //               >
    //                 <circle
    //                   cx="12"
    //                   cy="8"
    //                   r="5"
    //                 />
    //                 <path d="M20 21a8 8 0 0 0-16 0" />
    //               </svg>
    //             )}
    //           </span>
    //         </Link>

    //         <Link
    //           href={
    //             isSignedIn
    //               ? '/account/wishlists'
    //               : `/login?redirect=${encodeURIComponent(`/${locale}/account/wishlists`)}`
    //           }
    //           locale={locale}
    //           className="relative hover:text-terra"
    //           aria-label="Wishlist"
    //         >
    //           <span aria-hidden="true">
    //             {isSignedIn ? (
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="20"
    //                 height="20"
    //                 viewBox="0 0 24 24"
    //                 fill="currentColor"
    //                 stroke="none"
    //                 strokeWidth="0"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 className="lucide lucide-heart-icon lucide-heart"
    //               >
    //                 <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    //               </svg>
    //             ) : (
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="20"
    //                 height="20"
    //                 viewBox="0 0 24 24"
    //                 fill="none"
    //                 stroke="currentColor"
    //                 strokeWidth="2"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 className="lucide lucide-heart-icon lucide-heart"
    //               >
    //                 <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    //               </svg>
    //             )}
    //           </span>
    //           {isSignedIn && wishlistCount > 0 && (
    //             <span className="absolute -top-1/2 left-1/2 inline-flex items-center justify-center rounded-full bg-terra text-white text-xs w-5 h-5">
    //               {wishlistCount}
    //             </span>
    //           )}
    //         </Link>

    //         <MiniCart locale={locale} />
    //       </div>
    //     </div>

    //     <SearchForm locale={locale} className="mt-3 md:hidden" />
    //   </div>
    // </header>
  );
}
