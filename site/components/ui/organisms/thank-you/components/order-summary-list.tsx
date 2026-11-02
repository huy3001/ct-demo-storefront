import { FC } from 'react';
import { useParams } from 'next/navigation';
import { Order } from '@/types/cart/Order';
import OrderLineItem from './order-item';
import { getLocalizedString } from '@/lib/utils';

type OrderSummaryListProps = {
  className?: string;
  order?: Order;
};

const OrderSummaryList: FC<OrderSummaryListProps> = ({ className, order }) => {
  const { locale } = useParams();

  return (
    <div className={className}>
      {order?.lineItems?.map((lineItem) => (
        <OrderLineItem
          key={lineItem.id}
          {...{
            ...lineItem,
            name: getLocalizedString(lineItem.name, locale),
            productSlug: getLocalizedString(lineItem.productSlug, locale),
          }}
        />
      ))}

      {!order?.lineItems && <OrderLineItem />}
    </div>
  );
};

export default OrderSummaryList;
