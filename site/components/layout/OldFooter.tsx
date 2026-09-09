'use client';

import { COUNTRY_CONFIG } from '@/lib/utils';

export default function Footer({ locale }: { locale: string }) {
  function onLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    document.cookie = `your-shop-country-locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    const pathWithoutLocale = window.location.pathname.split('/').slice(2).join('/');
    const nextPath = `/${nextLocale}/${pathWithoutLocale}`;
    window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`);
  }

  return (
    <footer className="border-t border-border mt-16 bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-charcoal-light flex flex-col gap-4 md:flex-row items-center md:justify-between">
        <p>© {new Date().getFullYear()} Storefront. All rights reserved.</p>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <label className="flex items-center gap-2">
            <span>Country</span>
            <select
              id="country-locale"
              value={locale}
              onChange={onLocaleChange}
              className="rounded-sm border border-border bg-white px-2 py-1.5 text-sm text-charcoal"
              aria-label="Select country and locale"
            >
              {Object.entries(COUNTRY_CONFIG).map(([localeKey, config]) => (
                <option key={localeKey} value={localeKey}>
                  {config.label}
                </option>
              ))}
            </select>
          </label>
          <p>Powered by commercetools</p>
        </div>
      </div>
    </footer>
  );
}
