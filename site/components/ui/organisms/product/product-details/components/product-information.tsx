import { FC } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import WishlistButton from '@/components/ui/organisms/wishlist/components/wishlist-button';
import useClassNames from '@/hooks/useClassNames';
import usePath from '@/hooks/usePath';
import { useRouter } from '@/i18n/routing';
import { ProductDetailsProps } from '..';
import ProductVariant from './product-variant';
import { formatMoney } from '@/lib/utils';

type ProductInformationProps = Omit<ProductDetailsProps, 'onAddToCart'>;

const ProductInformation: FC<ProductInformationProps> = ({
  product,
  variant,
  onChangeVariant,
  inModalVersion,
}) => {
  const router = useRouter();

  const translate = useTranslations();

  const { locale } = useParams();

  const { path } = usePath();

  const attributesToDisplay = [
    'color',
    'finish',
    'size',
    'color-label',
    'finish-label',
  ];

  const discountPercentage =
    variant?.price?.discounted &&
    ((variant?.price?.centAmount as number) -
      (variant?.price?.discounted?.centAmount as number)) /
      (variant?.price?.centAmount as number);

  const updateVariantSKU = (sku: string) => {
    router.replace(
      `/${path.split('/').filter(Boolean).slice(0, -1).join('/')}/${sku}`,
    );
  };

  const titleClassName = useClassNames([
    'break-normal mb-12',
    { '2xl:text-18': !inModalVersion },
  ]);
  const priceClassName = useClassNames([
    'block leading-loose',
    { 'line-through text-gray-500': !!discountPercentage },
    { '2xl:text-20': !inModalVersion },
    { 'text-14': !!inModalVersion && !discountPercentage },
    { 'text-12': !!inModalVersion && !!discountPercentage },
  ]);
  const discountedPriceClassName = useClassNames([
    'block font-regular leading-loose text-red-500',
    { '2xl:text-18': !inModalVersion },
  ]);

  return (
    <div>
      <div className="relative flex items-start justify-between pr-10">
        <h1 className={`${titleClassName} font-medium leading-loose`}>
          {product?.name}
        </h1>
        <WishlistButton
          productId={product?.id ?? ''}
          variantId={variant?.id ?? 0}
          className="size-7 lg:size-8"
        />
      </div>
      {discountPercentage ? (
        <div className="flex flex-row justify-between">
          <div className="flex items-center gap-2">
            <p className={discountedPriceClassName}>
              {formatMoney(
                variant?.price?.centAmount ?? 0,
                variant?.price?.currencyCode ?? 'USD',
                locale,
              )}
            </p>
            <p className={priceClassName}>
              {formatMoney(
                variant?.price?.centAmount ?? 0,
                variant?.price?.currencyCode ?? 'USD',
                locale,
              )}
            </p>
          </div>

          {
            <span className="mb-2 ml-2 mt-2.5 flex h-6 w-11 items-center justify-center bg-red-500 text-11 text-white">
              {translate('common.percentage', { value: discountPercentage })}
            </span>
          }
        </div>
      ) : (
        <p className={priceClassName}>
          {formatMoney(
            variant?.price?.centAmount ?? 0,
            variant?.price?.currencyCode ?? 'USD',
            locale,
          )}
        </p>
      )}
      {attributesToDisplay.map((attribute) => {
        if (variant?.attributes?.some(({ name }) => name === attribute)) {
          return (
            <ProductVariant
              key={attribute}
              className="mt-5 border-b border-b-neutral-400 pb-5 md:mt-6"
              variants={product?.variants}
              currentVariant={variant}
              attribute={attribute}
              inModalVersion={inModalVersion}
              onClick={inModalVersion ? onChangeVariant : updateVariantSKU}
            />
          );
        }
      })}
    </div>
  );
};

export default ProductInformation;
