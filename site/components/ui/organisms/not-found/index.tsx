'use client';

import { useTranslations } from 'use-intl';
import Button from '@/components/ui/atoms/button';
import Image, { ImageProps } from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';

type NotFoundProps = {
  image?: ImageProps;
};

const NotFound = ({ image }: NotFoundProps) => {
  const translate = useTranslations();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 mx-auto max-w-7xl px-4 py-20 md:my-16 md:py-30 lg:flex-row-reverse lg:gap-20 xl:py-50">
      <div className="relative w-40 md:w-50 lg:w-100">
        <Image
          {...image}
          src={image?.media?.file ?? ''}
          alt={image?.media?.name ?? 'Not Found Image'}
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      <div className="mx-15 text-center md:mx-0 lg:text-left">
        <h1 className="font-semibold text-lg text-gray-700 md:text-2xl lg:text-3xl">
          {translate('common.page-notFound')}
        </h1>
        <p className="mb-6 mt-3 text-sm text-gray-600 md:text-base lg:mb-7 lg:mt-6">
          {translate('common.page-notFound-desc')}
        </p>
        <Link link="/">
          <Button variant="primary">
            {translate('common.page-notFound-cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
