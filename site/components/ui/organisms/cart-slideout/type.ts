import { ImageProps } from '@/components/ui/atoms/image';
import { Link } from '../header/types';
import type { DiscountCode } from '@commercetools/platform-sdk';

export interface CartSlideoutProps {
  isEmpty?: boolean;
  onRemoveDiscountCode?: (discount: DiscountCode) => Promise<void>;
  emptyStateImage: ImageProps;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  emptyStateCategories: Link[];
  handleCategoryClick?: () => void;
}
