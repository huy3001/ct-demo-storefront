import { FC } from 'react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Link from '@/components/ui/atoms/link';
import { useRouter } from '@/i18n/routing';
import MobileMenuNavButton from '../atoms/menu-nav-button';
import ShippingAndLanguageSectionMobile from '@/components/ui/organisms/shipping-and-language/ship-and-language-mobile';
import { useAccount } from '@/hooks/useAccount';
import type { Category } from '@/lib/types';

export interface Props {
  showMenu: boolean;
  insertCategory: (category: Category) => void;
  hideHeaderMenu: () => void;
}

const MobileMenuFooter: FC<Props> = ({ hideHeaderMenu, insertCategory }) => {
  const router = useRouter();
  const translate = useTranslations();
  const { isSignedIn, logout } = useAccount();

  const tabs = [
    { name: translate('account.dashboard'), href: '/account' },
    { name: translate('account.profile'), href: '/account/profile' },
    { name: translate('account.addresses'), href: '/account/addresses' },
    {
      name: translate('account.approval-flows'),
      href: '/account/approval-flows',
    },
    {
      name: translate('account.approval-rules'),
      href: '/account/approval-rules',
    },
    { name: translate('account.company'), href: '/account/company' },
    { name: translate('account.orders'), href: '/account/orders' },
    { name: translate('account.quotes'), href: '/account/quotes' },
    { name: translate('account.wishlists'), href: '/account/wishlists' },
  ];

  const accountButton: Category = {
    id: 'myAccount',
    name: translate('account.my-account'),
    slug: 'account',
    showInNavigation: true,
    children: tabs.map((tab) => {
      return {
        id: tab.href,
        name: tab.name,
        slug: tab.href,
        showInNavigation: true,
        children: [],
      };
    }),
  };

  const handleLogout = () => {
    logout().then(() => router.push('/login'));
    hideHeaderMenu();
  };

  return (
    <>
      <div className="mb-4 mt-3 w-full border border-neutral-400" />

      {isSignedIn ? (
        <div className="mx-6 block pt-4 md:hidden">
          <MobileMenuNavButton
            link={accountButton}
            onClick={() => insertCategory(accountButton)}
            hideHeaderMenu={hideHeaderMenu}
            isAccountMenu
          />
        </div>
      ) : (
        <div className="mx-6 block py-4 md:hidden">
          <Link
            link="/help"
            onClick={hideHeaderMenu}
            className="py-4"
          >
            <p className="text-primary">
              {translate('common.help-and-support')}
            </p>
          </Link>
        </div>
      )}

      <div className="mx-6 flex py-4">
        <Link
          link="/find-store"
          onClick={hideHeaderMenu}
        >
          Find Store
        </Link>
      </div>

      <div className="mx-6 flex py-4">
        {isSignedIn ? (
          <Button
            variant="ghost"
            size="fit"
            onClick={handleLogout}
            className="text-base!"
          >
            <span className="font-normal text-primary">
              {translate('account.sign-out')}
            </span>
          </Button>
        ) : (
          <Link
            link="/login"
            onClick={hideHeaderMenu}
            className="px-0"
          >
            <span className="font-normal text-primary">
              {translate('account.sign-in')}
            </span>
          </Link>
        )}
      </div>

      <div className="p-4">
        <ShippingAndLanguageSectionMobile />
      </div>
    </>
  );
};

export default MobileMenuFooter;
