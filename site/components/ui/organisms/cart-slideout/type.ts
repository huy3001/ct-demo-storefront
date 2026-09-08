import { ImageProps } from '@/components/ui/atoms/image';
import { Link } from '../header/types';
import type { DiscountCodeInfo as DiscountCode } from '@commercetools/platform-sdk';

export interface CartSlideoutProps {
  isEmpty?: boolean;
  onApplyDiscountCode?: (code: string) => Promise<void>;
  onRemoveDiscountCode?: (discount: DiscountCode) => Promise<void>;
  emptyStateImage: ImageProps;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  emptyStateCategories: Link[];
  handleCategoryClick?: () => void;
}
