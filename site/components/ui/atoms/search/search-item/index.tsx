import React, { useCallback, useMemo } from 'react';
import Image from '@/components/ui/atoms/image';
import { trackEvent } from '@/helpers/analytics';
import { AUTOCOMPLETE_PRODUCT_CLICKED } from '@/helpers/constants/events';
import { useRouter } from '@/i18n/routing';
import { Category } from '@/types/entity/category';
import { Product } from '@/types/entity/product';
import Link from '../../link';

interface Props {
  hit: Product;
  categories: Category[];
  onClick?: () => void;
}

const SearchItem: React.FC<Props> = ({ hit, categories, onClick }) => {
  const router = useRouter();

  const primaryCategory = useMemo(
    () => categories.find((category) => category.categoryId === hit.categories?.[0]?.categoryId),
    [categories, hit],
  );

  const variant = useMemo(() => hit.variants?.[0], [hit]);

  const handleClick = useCallback(() => {
    onClick?.();

    trackEvent(AUTOCOMPLETE_PRODUCT_CLICKED, hit);

    router.push(hit._url ?? '#');
  }, [hit, onClick, router]);

  return (
    <Link link={hit._url} onMouseUp={handleClick}>
      <div className="flex items-center gap-3">
        <div className="shrink-0 p-2">
          <div className="relative h-22.5 w-20">
            <Image src={variant?.images?.[0]} alt={hit.name} suffix="small" style={{ objectFit: 'contain' }} fill />
          </div>
        </div>
        <div>
          <p className="text-base uppercase text-primary">{hit.name}</p>
          <div className="mt-1">
            <span className="text-sm text-gray-600">{primaryCategory?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchItem;
