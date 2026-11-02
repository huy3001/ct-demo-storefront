import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'use-intl';
import useI18n from '@/hooks/useI18n';
import mapCosts from '@/helpers/utils/mapCosts';
import { Money } from '@/types/entity/product';
import { CostsProps, CostRef } from '../types';

export type UseCostsData = (props: Pick<CostsProps, 'dataReference' | 'order'>) => {
  costsToRender: CostRef[];
  total: CostRef;
  loading: boolean;
};

const useCostsData: UseCostsData = ({ dataReference = 'cart', order }) => {
  const { currency } = useI18n();
  const translate = useTranslations();

  const [loading, setLoading] = useState(true);

  const transaction = useMemo(
    () => mapCosts({ cart: order, currency }),
    [order, currency],
  );

  const skeletonMoney: Money = useMemo(() => {
    return { fractionDigits: 2, centAmount: 999, currencyCode: 'USD' };
  }, []);

  const skeletonCosts = useMemo(
    () => [
      {
        key: 'subtotal',
        label: translate('cart.subtotal'),
        value: skeletonMoney,
      },
      {
        key: 'shipping',
        label:
          dataReference === 'cart' && transaction.isEstimatedShipping
            ? translate('cart.shipping-estimate')
            : translate('cart.shipping'),
        value: skeletonMoney,
      },
      {
        key: 'tax',
        label: translate('cart.tax'),
        value: skeletonMoney,
      },
      {
        key: 'discount',
        label: translate('cart.discount'),
        value: skeletonMoney,
      },
    ],
    [translate, skeletonMoney, transaction.isEstimatedShipping, dataReference],
  ) as CostRef[];

  const costsToRender = useMemo(() => {
    const dataIsHydrated = (dataReference === 'order' && order) || (dataReference === 'cart' && !!transaction.total);

    if (!dataIsHydrated) return [];

    const costsToUse = dataReference === 'cart' ? transaction : mapCosts({ cart: order, currency });

    const costs = [...skeletonCosts].map(({ key, label }) => {
      return {
        key,
        label,
        value: costsToUse[key],
      };
    }) as CostRef[];

    return costs;
  }, [currency, dataReference, order, skeletonCosts, transaction]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (costsToRender.length) setLoading(false);
  }, [costsToRender]);

  const total: CostRef = {
    key: 'total',
    label: translate('cart.total'),
    value: dataReference === 'order' ? mapCosts({ cart: order, currency }).total : transaction.total,
  };

  return { loading, costsToRender: loading ? skeletonCosts : costsToRender, total };
};

export default useCostsData;
