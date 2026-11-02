import React, { FC } from 'react';
import { SwiperProps } from 'swiper/react';
import Slider from '@/components/ui/atoms/slider';
import Subtitle, { SubtitleProps } from '@/components/ui/atoms/subtitle';
import ProductTile from '@/components/ui/molecules/product-tile';
import Wrapper from '@/components/HOC/wrapper';
import useClassNames from '@/hooks/useClassNames';
import useTouchDevice from '@/hooks/useTouchDevice';
import { mediumDesktop, tablet } from '@/helpers/utils/screensizes';
import { Cart, ShippingMethod } from '@/types/entity/cart';
import { Reference } from '@/types/reference';
import useTrack from './useTrack';
import Link from '../../content/link';
import type { Product, Variant } from '@/lib/types';

export interface ProductSliderProps extends Partial<SwiperProps> {
  products: Product[];
  cart?: Cart;
  shippingMethods?: ShippingMethod[];
  title: string;
  titleVariant?: 'xs' | 'sm' | 'lg';
  subline?: string;
  subtitleVariant?: SubtitleProps['variant'];
  ctaLabel?: string;
  ctaLink?: Reference;
  clearDefaultWrapperStyles?: boolean;
  slidesPerView?: number;
  disableProductQuickView?: boolean;
  disableProductWishlistButton?: boolean;
  disableProductVariants?: boolean;
  innerArrows?: boolean;
  solidArrows?: boolean;
  onProductClick?: (product: Product) => void;
  classNames?: {
    title?: string;
  };
  variant?: 'normal' | 'cart';
  onAddToCart?: (variant: Variant, quantity: number) => Promise<void>;
}

const ProductSlider: FC<ProductSliderProps> = ({
  products,
  cart,
  shippingMethods,
  title,
  subline,
  ctaLabel,
  ctaLink,
  titleVariant = 'lg',
  subtitleVariant = 'lg',
  clearDefaultWrapperStyles = false,
  disableProductQuickView = false,
  disableProductWishlistButton = false,
  disableProductVariants = false,
  innerArrows = true,
  solidArrows = true,
  breakpoints = {},
  classNames = {},
  onProductClick,
  onAddToCart,
  spaceBetween = 8,
  ...props
}) => {
  const { isTouchDevice } = useTouchDevice();

  const { trackClick } = useTrack();

  const titleClassName = useClassNames([
    'mb-12 text-20',
    classNames.title,
    {
      xs: 'md:text-16',
      sm: 'md:text-18 lg:text-22',
      lg: 'md:text-22 lg:text-28',
    }[titleVariant ?? 'lg'],
  ]);

  return (
    <Wrapper background="neutral-200" clearDefaultStyles={clearDefaultWrapperStyles}>
      <div>
        <p className={titleClassName}>{title}</p>
        {(subline || ctaLink) && (
          <div className="mt-8 flex items-center justify-between md:mt-16 lg:mt-14">
            {subline && <Subtitle subtitle={subline} variant={subtitleVariant} />}
            {ctaLink && (
              <div className="hidden lg:block">
                <Link target={ctaLink} withArrow>
                  <span className="font-medium leading-6 text-gray-600">{ctaLabel}</span>
                </Link>
              </div>
            )}
          </div>
        )}
        {ctaLink && (
          <div className="mt-20 block md:mt-16 lg:hidden">
            <Link target={ctaLink} withArrow>
              <span className="font-medium leading-6 text-gray-600">{ctaLabel}</span>
            </Link>
          </div>
        )}
      </div>
      <div className="pt-20 md:pt-24 lg:pt-20">
        <Slider
          slidesPerView={isTouchDevice ? 2.3 : 1.3}
          slidesPerGroup={1}
          dots={false}
          arrows
          innerArrows={innerArrows}
          solidArrows={solidArrows}
          nextButtonStyles={{ transform: 'translateY(-150%)' }}
          prevButtonStyles={{ transform: 'translateY(-150%)' }}
          allowTouchMove
          spaceBetween={spaceBetween as number}
          breakpoints={{
            [tablet]: {
              slidesPerView: 2.3,
              spaceBetween: 25,
              ...(breakpoints[tablet] ?? {}),
            },
            [mediumDesktop]: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 25,
              ...(breakpoints[mediumDesktop] ?? {}),
            },
          }}
          {...props}
        >
          {products.map((product, index) => (
            <ProductTile
              key={product.id}
              cart={cart}
              shippingMethods={shippingMethods}
              disableQuickView={disableProductQuickView}
              disableWishlistButton={disableProductWishlistButton}
              disableVariants={disableProductVariants}
              product={product}
              onClick={() => {
                trackClick(product, index + 1);
                onProductClick?.(product);
              }}
              onAddToCart={onAddToCart}
            />
          ))}
        </Slider>
      </div>
    </Wrapper>
  );
};

export default ProductSlider;
