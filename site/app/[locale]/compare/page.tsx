import { Link } from '@/i18n/routing';
import Breadcrumb from '@/components/ui/molecules/breadcrumb';
import CompareProducts from '@/components/compare/CompareProducts';
import { getProductAttributeLabels } from '@/lib/ct/product-attributes';

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const labels = await getProductAttributeLabels(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        Separator="/"
        className="mb-7 hidden w-fit md:block"
        listClassName="px-0!"
      >
        <Link
          href="/"
          locale={locale}
          className="text-sm text-charcoal-light hover:text-terra"
        >
          Home
        </Link>

        <span className="cursor-default text-sm truncate text-charcoal">
          Compare
        </span>
      </Breadcrumb>
      <CompareProducts
        locale={locale}
        labels={labels}
      />
    </div>
  );
}
