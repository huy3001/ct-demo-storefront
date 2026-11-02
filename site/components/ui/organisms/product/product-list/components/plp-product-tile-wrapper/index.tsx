import React, { FC } from 'react';
import ProductTile from '@/components/ui/molecules/product-tile';
import useSelectedColorFilterVariantIndex from '@/hooks/useSelectedColorFilterVariantIndex';
import { Cart } from '@/types/entity/cart';
import { useProductList } from '../../context';
import type { Product } from '@/lib/types';

interface ProductTileWrapperProps {
  product: Product;
  cart?: Cart;
  isSearchResult?: boolean;
  disableQuickView?: boolean;
  disableWishlistButton?: boolean;
  disableVariants?: boolean;
  onClick?: () => void;
}

const PlpProductTileWrapper: FC<ProductTileWrapperProps> = ({ product, cart, isSearchResult, onClick }) => {
  const { shippingMethods, onAddToCart } = useProductList();

  const selectedColorVariantIndex = useSelectedColorFilterVariantIndex(product.variants);

  return (
    <ProductTile
      product={product}
      cart={cart}
      shippingMethods={shippingMethods}
      selectedVariantIndex={selectedColorVariantIndex}
      isSearchResult={isSearchResult}
      onClick={onClick}
      onAddToCart={onAddToCart}
    />
  );
};

export default PlpProductTileWrapper;
