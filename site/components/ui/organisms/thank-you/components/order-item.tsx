import { FC } from 'react';
import { useParams } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import { LineItem } from '@/types/cart/LineItem';
import Image from '@/components/ui/atoms/image';
import { formatMoney } from '@/lib/utils';

const OrderLineItem: FC<LineItem> = ({ name, price, count, variant }) => {
  const { locale } = useParams();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-16 py-16 md:gap-32">
        <div className="relative h-104 w-89 shrink-0">
          {variant?.images?.[0] ? (
            <Image
              fill
              src={variant?.images?.[0].url}
              style={{ objectFit: 'contain' }}
              alt={variant?.sku ?? ''}
            />
          ) : (
            <Skeleton className="size-full" />
          )}
        </div>
        <div className="mt-10 grow overflow-hidden">
          <p className="block max-w-full truncate text-12 capitalize md:text-14">
            {name ?? 'product name'}
          </p>
          <p className="mt-8 block text-12 font-medium md:hidden lg:block lg:text-14">
            {formatMoney(
              price?.value?.centAmount ?? 0,
              price?.value?.currencyCode ?? 'USD',
              locale,
            )}
          </p>
          <p className="mt-12 text-14 text-gray-600">{'x ' + (count ?? '2')}</p>
        </div>
      </div>
      <p className="mt-8 hidden font-medium md:block lg:hidden">
        {formatMoney(
          price?.value?.centAmount ?? 0,
          price?.value?.currencyCode ?? 'USD',
          locale,
        )}
      </p>
    </div>
  );
};

export default OrderLineItem;
