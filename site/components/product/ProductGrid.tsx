import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  if (products.length === 0) {
    return <p className="text-charcoal-light py-16 text-center">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
