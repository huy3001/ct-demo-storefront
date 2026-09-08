import { FC, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Link from '@/components/ui/atoms/link';
import MarketButtonMobile from '@/components/ui/organisms/market-button/market-button-mobile';
import { useRouter } from '@/i18n/routing';
import MobileMenuNavButton from '../atoms/menu-nav-button';
import { useAccount } from '@/hooks/useAccount';
import type { Category } from '@/lib/types';

export interface Props {
  showMenu: boolean;
  insertCategory: (category: Category) => void;
  hideHeaderMenu: () => void;
}

const MobileMenuFooter: FC<Props> = ({ showMenu, hideHeaderMenu, insertCategory }) => {
  const router = useRouter();
  const translate = useTranslations();
  const marketButtonRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, logout } = useAccount();
  const [languageMenuTop, setLanguageMenuTop] = useState(false);

  const tabs = [
    { name: translate('account.my-account'), href: '/account' },
    { name: translate('account.orders'), href: '/account/?hash=orders' },
    {
      name: translate('account.customer-support'),
      href: '/account/?hash=support',
    },
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

  useLayoutEffect(() => {
    if (marketButtonRef.current) {
      if (window.innerHeight - marketButtonRef.current.getBoundingClientRect().bottom < 100) setLanguageMenuTop(true);
      else setLanguageMenuTop(false);
    }
  }, [showMenu]);

  return (
    <>
      <div className="mb-4 mt-3 w-full border border-neutral-400" />

      {isSignedIn ? (
        <div className="ml-6 mr-5.5 block pt-4 md:hidden">
          <MobileMenuNavButton
            link={accountButton}
            onClick={() => insertCategory(accountButton)}
            hideHeaderMenu={hideHeaderMenu}
            isAccountMenu
          />
        </div>
      ) : (
        <div className="ml-6 mr-5.5 block py-4 md:hidden">
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
      <div
        className="p-4"
        ref={marketButtonRef}
      >
        <MarketButtonMobile menuTop={languageMenuTop} />
      </div>
    </>
  );
};

export default MobileMenuFooter;
