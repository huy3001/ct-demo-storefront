'use client';

import { useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Product } from '@/lib/types';
import { Link } from '@/i18n/routing';
import ProductCard from './ProductCard';
import Button from '@/components/ui/atoms/button';

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
  showBorder = true,
  viewAllHref,
  viewAllLabel = 'Shop all',
}: {
  products: Product[];
  locale: string;
  title?: string;
  headingId?: string;
  showBorder?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (instance: SwiperInstance) => {
    setIsBeginning(instance.isBeginning);
    setIsEnd(instance.isEnd);
  };

  return (
    <section
      aria-labelledby={headingId}
      className={`mt-16 ${showBorder ? 'border-t border-border pt-14' : 'mb-16'}`}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2
          id={headingId}
          className="text-xl font-semibold text-charcoal"
        >
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            locale={locale}
            className="flex items-center gap-2 text-sm font-medium text-charcoal underline-offset-4 hover:underline"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>

      <div className="relative">
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
            1024: { slidesPerView: 4 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide
              key={product.id}
              className="h-auto"
            >
              <ProductCard
                product={product}
                locale={locale}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {products.length > 1 && (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => swiper?.slidePrev()}
              disabled={isBeginning}
              aria-label={`Previous ${title.toLowerCase()}`}
              className="absolute! top-2/5! -translate-y-1/2! z-10 left-2! rounded-full! shadow-sm! transition-colors! disabled:opacity-30!"
            >
              <ArrowIcon direction="previous" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => swiper?.slideNext()}
              disabled={isEnd}
              aria-label={`Next ${title.toLowerCase()}`}
              className="absolute! top-2/5! -translate-y-1/2! z-10 right-2! rounded-full! shadow-sm! transition-colors! disabled:opacity-30!"
            >
              <ArrowIcon direction="next" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
