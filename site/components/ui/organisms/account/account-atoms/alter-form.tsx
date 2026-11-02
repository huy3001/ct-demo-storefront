import { FC, useMemo } from 'react';
import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import { useRouter } from '@/i18n/routing';

type AlterFormProps = {
  page: 'login' | 'register';
};
type PageBasedData = { [key in AlterFormProps['page']]: { title: string; buttonLabel: string; link: string } };

const AlterForm: FC<AlterFormProps> = ({ page }) => {
  const router = useRouter();
  const translate = useTranslations();

  const pageBasedData: PageBasedData = useMemo(() => {
    return {
      login: {
        title: translate('account.welcome-back'),
        buttonLabel: translate('account.sign-in'),
        link: '/login',
      },
      register: {
        title: translate('account.not-member-yet'),
        buttonLabel: translate('account.account-register'),
        link: '/register',
      },
    };
  }, [translate]);

  const title = useMemo(() => pageBasedData[page].title, [page, pageBasedData]);
  const buttonLabel = useMemo(() => pageBasedData[page].buttonLabel, [page, pageBasedData]);

  const handleClick = () => {
    router.push(pageBasedData[page].link);
  };

  return (
    <div className="mt-9 border-t border-t-neutral-400 pt-10 md:mt-14 md:pt-14 lg:mt-21 lg:pt-21">
      <div className="m-auto grid max-w-screen-sm px-4">
        <h3 className="text-base text-primary md:text-xl lg:text-2xl">{title}</h3>
        <Button
          className="mt-4.5 h-8 py-0 font-medium md:mt-6 md:h-10 md:text-base"
          variant="secondary"
          onClick={handleClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export default AlterForm;
