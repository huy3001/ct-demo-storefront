import { FC } from 'react';
import { useTranslations } from 'use-intl';
import Image, { ImageProps } from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import { SocialMedia } from '.';

interface Props {
  logo?: ImageProps;
  socialMedia?: SocialMedia[];
  locale?: string;
}

const FooterBottom: FC<Props> = ({ socialMedia }) => {
  const translate = useTranslations();

  const socialLinks = () => (
    <ul className="flex flex-row gap-5 self-center">
      {socialMedia?.map((item, i) => (
        <li
          key={i}
          className="w-6"
        >
          <Link
            link={item.reference}
            title={item?.title ?? item.logo?.media?.name}
          >
            <Image
              {...item.logo}
              src={item.logo?.media?.file}
              alt={item?.title ?? item.logo?.media?.name}
            />
          </Link>
        </li>
      ))}
    </ul>
  );

  const copyright = () => (
    <p className="text-sm text-neutral-500 text-center">
      <span className="block md:inline-block md:mr-1">© {new Date().getFullYear()} Storefront. All rights reserved.</span>
      {translate('common.powered')}
    </p>
  );

  return (
    <>
      <div className="hidden py-9 md:flex md:flex-col md:gap-8 xl:gap-20 xl:flex-row-reverse xl:items-center xl:justify-between xl:py-12">
        {/* {logo && (
          <div className="w-40">
            <Image
              {...logo}
              src={logo.media?.file}
              alt="logo"
            />
          </div>
        )} */}

        <div className="flex items-center justify-between gap-20 grow">
          {copyright()}
          {socialLinks()}
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 py-8 md:hidden">
        {/* {logo && (
          <div className="mb-4 w-47.5">
            <Image
              {...logo}
              src={logo.media?.file}
              alt="logo"
            />
          </div>
        )} */}

        {socialLinks()}

        {copyright()}
      </div>
    </>
  );
};

export default FooterBottom;
