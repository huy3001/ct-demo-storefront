'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, FreeMode, Keyboard, Thumbs, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

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

export default function ProductImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [mainSwiper, setMainSwiper] = useState<SwiperInstance | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);
  const [zoomScale, setZoomScale] = useState(MIN_ZOOM);
  const [mainIndex, setMainIndex] = useState(0);

  if (images.length === 0) {
    return (
      <section aria-label="Product images">
        <div className="flex aspect-square items-center justify-center rounded-sm bg-cream-dark text-charcoal-light">
          No image available
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Product images"
      className="min-w-0"
    >
      <div className="relative overflow-hidden rounded-sm bg-white">
        <Swiper
          modules={[A11y, Keyboard, Thumbs, Zoom]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => {
            swiper.zoom.out();
            setZoomScale(MIN_ZOOM);
            setMainIndex(swiper.activeIndex);
          }}
          onZoomChange={(_, scale) => setZoomScale(scale)}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          keyboard={{ enabled: true }}
          zoom={{ minRatio: MIN_ZOOM, maxRatio: MAX_ZOOM }}
          className="aspect-square"
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${src}-${index}`}>
              <div className="swiper-zoom-container relative h-full w-full">
                <Image
                  src={src}
                  alt={`${productName}${images.length > 1 ? ` - view ${index + 1}` : ''}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-contain p-4 md:p-8"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => mainSwiper?.slidePrev()}
              disabled={mainIndex === 0}
              aria-label="Previous product image"
              className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowIcon direction="previous" />
            </button>
            <button
              type="button"
              onClick={() => mainSwiper?.slideNext()}
              disabled={mainIndex === images.length - 1}
              aria-label="Next product image"
              className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowIcon direction="next" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 z-10 flex overflow-hidden rounded-sm border border-border bg-white/95 shadow-sm">
          <button
            type="button"
            onClick={() => mainSwiper?.zoom.out()}
            disabled={zoomScale <= MIN_ZOOM}
            aria-label="Zoom out"
            className="flex size-10 items-center justify-center text-xl text-charcoal transition-colors hover:bg-cream-dark disabled:cursor-not-allowed disabled:text-charcoal/30"
          >
            <span aria-hidden>−</span>
          </button>
          <span
            className="flex min-w-14 items-center justify-center border-x border-border text-xs text-charcoal-light"
            aria-live="polite"
          >
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => mainSwiper?.zoom.in()}
            disabled={zoomScale >= MAX_ZOOM}
            aria-label="Zoom in"
            className="flex size-10 items-center justify-center text-xl text-charcoal transition-colors hover:bg-cream-dark disabled:cursor-not-allowed disabled:text-charcoal/30"
          >
            <span aria-hidden>+</span>
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="relative mt-3">
          <Swiper
            modules={[A11y, FreeMode, Keyboard, Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={12}
            slidesPerView={3.5}
            breakpoints={{
              480: { slidesPerView: 4.5 },
              768: { slidesPerView: 5.5 },
            }}
            freeMode
            keyboard={{ enabled: true }}
            watchSlidesProgress
            slideToClickedSlide
            className="[&_.swiper-slide-thumb-active]:border-terra"
          >
            {images.map((src, index) => (
              <SwiperSlide
                key={`${src}-thumbnail-${index}`}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-sm border-2 border-transparent bg-white transition-colors hover:border-charcoal/30"
              >
                <Image
                  src={src}
                  alt={`Select ${productName} image ${index + 1}`}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}
