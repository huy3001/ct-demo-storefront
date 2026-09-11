import type { Product } from '@/lib/types';
import ProductTile from '@/components/ui/molecules/product-tile';
import { shippingMethods } from '@/helpers/mocks/mockCommonData';
import { wishlist } from '@/helpers/mocks/mockData';

export default function ProductGrid({
  products,
  // locale,
}: {
  products: Product[];
  locale?: string;
}) {
  if (products.length === 0) {
    return (
      <p className="text-charcoal-light py-16 text-center">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
      {products.map((product) => (
        <ProductTile
          key={product.id}
          product={product}
          wishlist={wishlist}
          shippingMethods={shippingMethods}
        />
      ))}
    </div>
  );
}
