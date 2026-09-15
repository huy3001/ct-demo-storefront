import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Toaster from '@/components/ui/atoms/toaster';
import BackToTopButton from '@/components/layout/BackToTopButton';
import { getCategoryTree } from '@/lib/ct/category';

export const metadata: Metadata = {
  title: 'Storefront',
  description: 'A commercetools-powered storefront',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [messages, categoryTree] = await Promise.all([
    getMessages(),
    getCategoryTree(locale),
  ]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      <Header
        locale={locale}
        categoryTree={categoryTree}
      />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <BackToTopButton />
      <Toaster />
    </NextIntlClientProvider>
  );
}
