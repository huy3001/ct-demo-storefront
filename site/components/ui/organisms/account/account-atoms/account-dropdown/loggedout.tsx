import React from 'react';
import { PopoverButton } from '@headlessui/react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Link from '@/components/ui/atoms/link';
import { useRouter } from '@/i18n/routing';

const LoggedOut = () => {
  const router = useRouter();
  const translate = useTranslations();

  const goToLoginPage = () => router.push('/login');

  return (
    <div className="w-58.75 p-3.5">
      <PopoverButton
        as="div"
        className="w-full"
        tabIndex={-1}
      >
        <Button
          variant="primary"
          className="w-full py-3 text-base leading-4"
          onClick={goToLoginPage}
        >
          {translate('account.sign-in')}
        </Button>
      </PopoverButton>
      <PopoverButton tabIndex={-1}>
        <Link
          link="/"
          className="mt-5 block w-fit text-left text-primary hover:underline"
        >
          {translate('account.membership-info')}
        </Link>
      </PopoverButton>
      <div className="mt-8 flex flex-wrap gap-x-1 pb-2.5">
        <span className="whitespace-nowrap">
          {translate('account.not-member')}
        </span>
        <PopoverButton tabIndex={-1}>
          <Link
            link="/register"
            className="whitespace-nowrap font-medium text-primary hover:underline"
          >
            {translate('account.join-here')}
          </Link>
        </PopoverButton>
      </div>
    </div>
  );
};

export default LoggedOut;
