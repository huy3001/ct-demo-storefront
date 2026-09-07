import React, { useContext } from 'react';
import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import { AccountContext } from '@/context/account';
import { useRouter } from '@/i18n/routing';

const LoggedIn = () => {
  const router = useRouter();
  const translate = useTranslations();
  const { logout } = useContext(AccountContext);

  const handleLogout = () => {
    logout().then(() => router.push('/login'));
  };

  return (
    <div className="w-58.75 p-3.5 pb-6">
      <Link
        link="/account#"
        className="mt-2.5 block w-fit"
      >
        <p className="text-primary hover:underline">
          {translate('account.my-account')}
        </p>
      </Link>

      <Link
        link="/account/?hash=support"
        className="mt-8 block w-fit"
      >
        <p className="text-primary hover:underline">
          {translate('account.customer-support')}
        </p>
      </Link>

      <button
        onClick={handleLogout}
        className="mt-8 w-fit text-left"
      >
        <p className="text-base text-primary hover:underline">
          {translate('account.sign-out')}
        </p>
      </button>
    </div>
  );
};

export default LoggedIn;
