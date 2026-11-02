import { Order } from '@/types/cart';
import { Money } from '@/types/product/Money';
import { FrontasticImage } from '@/components/ui/atoms/image';
import { UseCartReturn } from '@/types/cart/Cart';

export type CostsProps = {
  className?: string;
  totalAmountClassName?: string;
  subCostsContainerClassName?: string;
  subCostClassName?: string;
  dataReference?: 'cart' | 'order';
  order?: Order;
  costs?: { subtotal: Money; shipping: Money; tax: Money; total: Money };
};

export type CostsLabel = keyof UseCartReturn['transaction'];

export type CostRef = { key: CostsLabel; label: string; value: Money };

export type CostsValueRef = {
  [key in 'cart' | 'order']: {
    [key in CostsLabel]: Money;
  };
};

export type PaymentMethod = {
  name: string;
  image: Pick<FrontasticImage, 'media'>;
};

export type PaymentMethodsProps = {
  paymentMethods: Array<PaymentMethod>;
};
