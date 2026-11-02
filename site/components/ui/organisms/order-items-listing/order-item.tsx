import { FC } from 'react';
import { useParams } from 'next/navigation';
import Image from '@/components/ui/atoms/image';
import { formatMoney } from '@/lib/utils';
import { LineItem } from '@/types/cart/LineItem';

type OrderItemProps = {
  lineItem: LineItem;
};

const OrderItem: FC<OrderItemProps> = ({ lineItem }) => {
  const { locale } = useParams();

  return (
    <div key={lineItem.lineItemId} className="flex justify-start border-b py-16">
      {lineItem.variant?.images?.[0] && (
        <div className="relative h-104 w-88 shrink-0">
          <Image fill src={lineItem.variant.images[0].url} style={{ objectFit: 'contain' }} alt={lineItem.name} />
        </div>
      )}
      <div className="flex flex-col justify-center pl-16">
        <p className="uppercase text-primary">{lineItem?.name}</p>
        <p className="mt-8 font-medium text-primary">
          {formatMoney(lineItem?.price?.value?.centAmount ?? 0, lineItem?.price?.value?.currencyCode ?? 'USD', locale)}
        </p>
        <p className="mt-8 text-primary">{`x ${lineItem?.count}`}</p>
      </div>
    </div>
  );
};

export default OrderItem;
