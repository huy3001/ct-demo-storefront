import React, { useContext, useMemo } from 'react';
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import AccountDropdown from '@/components/ui/organisms/account/account-atoms/account-dropdown';
import { AccountContext } from '@/context/account';

const AccountButton = () => {
  const { account, loggedIn } = useContext(AccountContext);
  const translate = useTranslations();
  const userName = useMemo(() => {
    return `${account?.salutation ?? translate('account.hello')} ${account?.firstName ?? translate('account.user')}`;
  }, [account?.firstName, account?.salutation, translate]);

  const title = account ? translate('account.account') : translate('account.sign-in');

  return (
    <div className="h-10">
      <Link link={account ? '/account' : '/login'} title={title} className="hidden md:flex lg:hidden">
        <UserIcon className="hidden h-fit w-7 text-gray-600 md:flex lg:hidden" />
      </Link>
      <Popover as="div" className="relative hidden h-fit lg:block">
        {() => (
          <>
            <PopoverButton title={title}>
              <div className="flex w-fit whitespace-nowrap">
                <div className="mr-2 hidden w-26 py-1 lg:inline-block">
                  {loggedIn && <p className="hidden truncate text-gray-600 lg:block">{userName}</p>}
                </div>

                <div className="border-primary pb-8 hover:border-b-2">
                  <UserIcon className="w-7 text-gray-600" />
                </div>
              </div>
            </PopoverButton>
            <PopoverBackdrop className="fixed inset-0 z-310 bg-gray-600 opacity-30" />
            <PopoverPanel className="absolute left-4 top-12.5 z-351 animate-[appearDropdown_0.15s_ease-in-out] rounded-sm bg-white shadow-400">
              <div className="absolute -top-5 left-1/2 z-10 w-8 -translate-x-1/2 overflow-hidden">
                <div className="size-5 origin-bottom-left rotate-45 bg-white" />
              </div>
              <AccountDropdown loggedIn={loggedIn} />
            </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  );
};

export default AccountButton;
