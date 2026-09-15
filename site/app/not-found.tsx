import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { getCategoryTree } from '@/lib/ct/category';
import { notFoundImage } from '@/helpers/mocks/mockData';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NotFound from '@/components/ui/organisms/not-found';

export default async function NotFoundPage() {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const categoryTree = await getCategoryTree(locale);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      <Header
        locale={locale}
        categoryTree={categoryTree}
      />
      <NotFound image={notFoundImage} />
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
