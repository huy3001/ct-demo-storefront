import { PopoverButton } from '@headlessui/react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Link from '@/components/ui/atoms/link';
import { useRouter } from '@/i18n/routing';

const LoggedOut = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const translate = useTranslations();

  const goToLoginPage = () => {
    onClose?.();
    router.push('/login');
  };

  return (
    <div className="w-58.75 p-4 space-y-3">
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
      <PopoverButton
        as="div"
        className="w-full pt-3 border-t border-gray-100"
        tabIndex={-1}
      >
        <Link
          link="/"
          className="block w-fit text-left text-charcoal hover:underline"
          onClick={onClose}
        >
          {translate('account.membership-info')}
        </Link>
      </PopoverButton>
      <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-x-1 items-center">
        <span className="whitespace-nowrap">
          {translate('account.not-member')}
        </span>
        <PopoverButton tabIndex={-1}>
          <Link
            link="/register"
            className="whitespace-nowrap font-medium text-charcoal py-3 hover:underline"
            onClick={onClose}
          >
            {translate('account.join-here')}
          </Link>
        </PopoverButton>
      </div>
    </div>
  );
};

export default LoggedOut;
