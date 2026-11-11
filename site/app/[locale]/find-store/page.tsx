import Link from 'next/link';
import FindStore from '@/components/store/FindStore';
import Breadcrumb from '@/components/ui/molecules/breadcrumb';
import { getStores } from '@/lib/ct/store';

export default async function FindStorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stores = await getStores(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        Separator="/"
        className="mb-7 hidden w-fit md:block"
        listClassName="px-0!"
      >
        <Link
          href={`/${locale}/`}
          locale={locale}
          className="text-sm text-charcoal-light hover:text-terra"
        >
          Home
        </Link>
        <span className="cursor-default truncate text-sm text-charcoal">
          Find a store
        </span>
      </Breadcrumb>
      <h1 className="text-3xl font-semibold text-charcoal sm:text-4xl">
        Find a store
      </h1>
      <FindStore
        stores={stores}
        locale={locale}
      />
    </div>
  );
}
