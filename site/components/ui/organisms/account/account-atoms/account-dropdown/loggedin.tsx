import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { PopoverButton } from '@headlessui/react';
import Button from '@/components/ui/atoms/button';
import Link from '@/components/ui/atoms/link';
import { useRouter } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

const LoggedIn = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const translate = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const { logout } = useAccount();

  const handleLogout = () => {
    onClose?.();
    logout().then(() => router.push('/login'));
  };

  const accountLinks = [
    { href: '/account/profile', label: translate('account.profile') },
    { href: '/account/addresses', label: translate('account.addresses') },
    {
      href: '/account/approval-flows',
      label: translate('account.approval-flows'),
    },
    {
      href: '/account/approval-rules',
      label: translate('account.approval-rules'),
    },
    { href: '/account/company', label: translate('account.company') },
    { href: '/account/orders', label: translate('account.orders') },
    { href: '/account/quotes', label: translate('account.quotes') },
    { href: '/account/wishlists', label: translate('account.wishlists') },
  ];

  return (
    <div className="w-58.75 p-4 space-y-3">
      <PopoverButton
        as="div"
        className="w-full"
        tabIndex={-1}
      >
        <Link
          link="/account"
          className={`block w-fit text-charcoal hover:underline ${pathname === `/${locale}/account` ? 'underline' : ''}`}
          onClick={onClose}
        >
          {translate('account.my-account')}
        </Link>
      </PopoverButton>

      {accountLinks.map(({ href, label }) => {
        return (
          <PopoverButton
            key={href}
            as="div"
            className="w-full pt-3 border-t border-gray-100"
            tabIndex={-1}
          >
            <Link
              link={href}
              className={`block w-fit text-charcoal hover:underline ${pathname === `/${locale}${href}` ? 'underline' : ''}`}
              onClick={onClose}
            >
              {label}
            </Link>
          </PopoverButton>
        );
      })}

      <Button
        variant="secondary"
        onClick={handleLogout}
        className="w-full leading-3.5"
      >
        {translate('account.sign-out')}
      </Button>
    </div>
  );
};

export default LoggedIn;
