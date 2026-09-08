'use client';

import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Category } from '@/lib/types';
import Header from '@/components/ui/organisms/header';
import { linkReferenceOne } from '@/helpers/mocks/mockCommonData';
import { emptyImage, logo, tiles } from '@/helpers/mocks/mockHeaderData';
import { Link } from '@/components/ui/organisms/header/types';

export default function HeaderContainer({
  locale,
  categoryTree,
}: {
  locale: string;
  categoryTree: Category[];
}) {
  const { itemCount: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  
  const categoryLinks = categoryTree.map((category) => ({
    name: category.name,
    reference: {
      link: '/category/' + category.slug,
      type: 'link',
    },
  }));
  console.log('categoryTree', categoryTree);

  return (
    <Header
      navLinks={categoryTree}
      logo={logo}
      categories={categoryTree}
      logoMobile={logo}
      logoLink={linkReferenceOne}
      logoLinkMobile={linkReferenceOne}
      emptyCartTitle={'Your cart is empty.'}
      emptyCartSubtitle={'Continue shopping?'}
      emptyCartImage={emptyImage}
      emptyCartCategories={categoryLinks as Link[]}
      emptyWishlistTitle={'Your wishlist is empty.'}
      emptyWishlistSubtitle={'Continue shopping?'}
      emptyWishlistImage={emptyImage}
      emptyWishlistCategories={categoryLinks as Link[]}
      tiles={tiles}
      searchItems={[]}
      totalCartItems={cartCount}
      totalWishlistItems={wishlistCount}
      locale={locale}
    />
  );
}
