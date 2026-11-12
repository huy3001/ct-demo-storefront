import { Link } from '@/i18n/routing';
import BrandList from '@/components/brand/BrandList';
import Breadcrumb from '@/components/ui/molecules/breadcrumb';
import { getProductBrands } from '@/lib/ct/product';

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const brands = await getProductBrands(locale);

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
          Brands
        </span>
      </Breadcrumb>
      <h1 className="text-3xl font-semibold text-charcoal sm:text-4xl">
        Brands
      </h1>
      <BrandList
        brands={brands}
        locale={locale}
      />
    </div>
  );
}
