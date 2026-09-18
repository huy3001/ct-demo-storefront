import { useCallback, useState } from 'react';
import { XMarkIcon as CloseIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Modal from '@/components/ui/organisms/modal';
import { Account } from '@/types/entity/account';
import Login from '../../authentication/login';

interface Props {
  login?: (email: string, password: string, rememberMe?: boolean) => Promise<Account>;
  requestConfirmationEmail?: (email: string, password: string) => Promise<{ error?: boolean; message?: string }>;
  requestPasswordReset?: (email: string) => Promise<{ error?: boolean; message?: string }>;
}

const LoginSuggestion = ({ login, requestConfirmationEmail, requestPasswordReset }: Props) => {
  const translate = useTranslations();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const loginLink = '/login?lvp=cart';

  return (
    <>
      <p className="mt-4 border-t border-neutral-400 pt-4 text-sm leading-5 text-gray-600 md:text-base lg:border-none">
        {translate('cart.order-summary-login')}
      </p>
      <Button
        className="mt-4"
        onClick={openLoginModal}
        size="full"
        variant="secondary"
      >
        {translate('account.sign-in')}
      </Button>

      <Modal
        isOpen={isLoginModalOpen}
        onRequestClose={closeLoginModal}
        className="relative w-[90%] rounded-md bg-white"
        style={{ content: { maxWidth: '600px' } }}
        closeTimeoutMS={200}
      >
        <CloseIcon
          className="absolute right-5 top-5 size-6 cursor-pointer text-gray-600"
          onClick={closeLoginModal}
        />
        <div className="p-px pb-12 pt-18">
          <Login
            login={async (email, password, rememberMe) => {
              const res = await login?.(email, password, rememberMe);
              if (!!res?.accountId) closeLoginModal();
              return res as Account;
            }}
            requestConfirmationEmail={requestConfirmationEmail}
            requestPasswordReset={requestPasswordReset}
            signInLink={{ type: 'link', link: loginLink }}
          />
        </div>
      </Modal>
    </>
  );
};

export default LoginSuggestion;
