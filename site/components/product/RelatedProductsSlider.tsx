'use client';

import { useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

import 'swiper/css';

function ArrowIcon({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-chevron-right-icon lucide-chevron-right size-5 ${direction === 'previous' ? 'rotate-180' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function RelatedProductsSlider({
  products,
  locale,
  title = 'Related products',
  headingId = 'related-products-heading',
}: {
  products: Product[];
  locale: string;
  title?: string;
  headingId?: string;
}) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (instance: SwiperInstance) => {
    setIsBeginning(instance.isBeginning);
    setIsEnd(instance.isEnd);
  };

  return (
    <section aria-labelledby={headingId} className="mt-20 border-t border-border pt-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 id={headingId} className="text-xl font-semibold text-charcoal">
          {title}
        </h2>
        {products.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              disabled={isBeginning}
              aria-label={`Previous ${title.toLowerCase()}`}
              className="flex size-10 items-center justify-center rounded-sm border border-border bg-white text-charcoal transition-colors hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowIcon direction="previous" />
            </button>
            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              disabled={isEnd}
              aria-label={`Next ${title.toLowerCase()}`}
              className="flex size-10 items-center justify-center rounded-sm border border-border bg-white text-charcoal transition-colors hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowIcon direction="next" />
            </button>
          </div>
        )}
      </div>

      <Swiper
        modules={[A11y, Keyboard]}
        onSwiper={(instance) => {
          setSwiper(instance);
          updateNavigation(instance);
        }}
        onSlideChange={updateNavigation}
        onResize={updateNavigation}
        keyboard={{ enabled: true }}
        spaceBetween={16}
        slidesPerView={1.4}
        breakpoints={{
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <ProductCard product={product} locale={locale} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
