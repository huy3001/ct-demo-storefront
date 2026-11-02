import { useEffect, useState } from 'react';
import { Order } from '@/types/cart/Order';
import useCart from '@/frontastic/hooks/useCart';

const useOrderFetch = () => {
  const { orderHistory, shippingMethods } = useCart();
  const [orders, setAccountOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderHistory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);

      orderHistory()
        .then((data) => {
          setAccountOrders(data);
          setLoading(false);
        })
        .catch(() => {
          setAccountOrders([]);
          setLoading(false);
        });
    }
  }, [orderHistory]);

  return {
    orders,
    shippingMethods,
    loading,
  };
};

export default useOrderFetch;
