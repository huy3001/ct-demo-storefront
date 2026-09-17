import React, { FC } from 'react';
import { useTranslations } from 'use-intl';
import Image, { ImageProps } from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import { SocialMedia } from '.';
import { COUNTRY_CONFIG } from '@/lib/utils';
import Dropdown from '@/components/ui/atoms/dropdown';

interface Props {
  logo?: ImageProps;
  socialMedia?: SocialMedia[];
  locale?: string;
}

const FooterBottom: FC<Props> = ({ logo, socialMedia, locale }) => {
  const translate = useTranslations();

  const onLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    document.cookie = `your-shop-country-locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    const pathWithoutLocale = window.location.pathname
      .split('/')
      .slice(2)
      .join('/');
    const nextPath = `/${nextLocale}/${pathWithoutLocale}`;
    window.location.assign(
      `${nextPath}${window.location.search}${window.location.hash}`,
    );
  };

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

  const countrySelector = () => (
    <label className="flex items-center gap-2">
      <span className="text-sm text-neutral-500">Country</span>
      <Dropdown
        id="country-locale"
        value={locale}
        onChange={onLocaleChange}
        containerClassName="min-w-35"
        items={Object.entries(COUNTRY_CONFIG).map(([localeKey, config]) => ({
          value: localeKey,
          label: config.label,
        }))}
      />
    </label>
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

        <div className="flex items-center justify-between gap-20 xl:basis-[47%]">
          {socialLinks()}
          {countrySelector()}
        </div>

        {copyright()}
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

        {countrySelector()}

        {copyright()}
      </div>
    </>
  );
};

export default FooterBottom;
