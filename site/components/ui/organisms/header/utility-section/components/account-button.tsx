import React, { useMemo } from 'react';
import { PopoverButton } from '@headlessui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import AccountDropdown from '@/components/ui/organisms/account/account-atoms/account-dropdown';
import Popover from '@/components/ui/molecules/popover';
import { useAccount } from '@/hooks/useAccount';
import useDisclosure from '@/hooks/useDisclosure';

const AccountButton = () => {
  const { customer, isSignedIn } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const translate = useTranslations();
  const userName = useMemo(() => {
    return `${customer?.salutation ?? translate('account.hello')} ${customer?.firstName ?? translate('account.user')}`;
  }, [customer?.firstName, customer?.salutation, translate]);

  const title = customer
    ? translate('account.account')
    : translate('account.sign-in');

  return (
    <div className="h-10">
      <Link
        link={customer ? '/account' : '/login'}
        title={title}
        className="hidden md:flex lg:hidden"
      >
        <UserIcon className="hidden h-fit w-7 text-charcoal md:flex lg:hidden" />
      </Link>

      <Popover
        isOpen={isOpen}
        onClose={onClose}
        direction="center"
        buttonElement={() => (
          <PopoverButton
            title={title}
            className="outline-none"
            onClick={onOpen}
          >
            <div className="flex gap-2 w-fit whitespace-nowrap">
              <div className="hidden py-1 lg:inline-block">
                {isSignedIn && (
                  <p className="hidden truncate text-charcoal lg:block">
                    {userName}
                  </p>
                )}
              </div>

              <div className="border-primary pb-2 hover:border-b-2">
                <UserIcon className="w-7 text-charcoal" />
              </div>
            </div>
          </PopoverButton>
        )}
      >
        <AccountDropdown
          loggedIn={isSignedIn}
          onClose={onClose}
        />
      </Popover>
    </div>
  );
};

export default AccountButton;
