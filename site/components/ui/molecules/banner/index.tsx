'use client';

import React, { useState } from 'react';
import { XMarkIcon as CloseIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/atoms/button';
import Image, { ImageProps } from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import { classnames } from '@/helpers/utils/classnames';
import { cva } from '@/helpers/utils/cva';
import { Reference } from '@/types/reference';

export interface BannerProps {
  title: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: Reference;
  image?: ImageProps;
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  variant?: 'primary' | 'secondary';
  className?: string;
  locale: string;
}

const Banner = ({
  title,
  heading,
  description,
  buttonText,
  buttonLink,
  image,
  size = 'md',
  alignment = 'left',
  variant = 'primary',
  className,
  locale,
}: BannerProps) => {
  const [isClosed, setIsClosed] = useState(false);

  const resolveClassName = cva({
    size: {
      sm: 'p-5 md:p-6 lg:p-8',
      md: 'p-6 md:p-8 lg:p-10',
      lg: 'px-6 py-8 md:p-12 lg:px-16 lg:py-20',
    },
  });
  
  const alignmentClassName = cva({
    alignment: {
      left: 'flex-col items-start text-left',
      center: 'flex-col items-center text-center',
      right: 'flex-col items-end text-right',
      justify:
        'flex-col md:flex-row md:items-center md:justify-between md:gap-8',
    },
  });

  const titleClassName = cva({
    variant: {
      primary: 'text-charcoal',
      secondary: 'text-white',
    },
  });

  const descriptionClassName = cva({
    variant: {
      primary: 'text-charcoal-light',
      secondary: 'text-white/75',
    },
  });

  if (isClosed) return <></>;

  return (
    <div className="px-4 py-6">
      <div
        className={classnames(
          'relative rounded-sm',
          resolveClassName(`size.${size}`).toString(),
          className,
        )}
      >
        <button
          className="absolute right-0 top-0 z-10 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-gray-600 p-1 lg:pointer-events-none lg:hidden"
          onClick={() => setIsClosed(true)}
        >
          <CloseIcon className="size-4 stroke-3 text-white" />
        </button>

        {image && (
          <Image
            {...image}
            fill
            className="brightness-75 z-0"
            alt={title}
            style={{ objectFit: 'cover' }}
          />
        )}

        <div
          className={classnames(
            'relative z-10 flex gap-5',
            alignmentClassName(`alignment.${alignment}`).toString(),
          )}
        >
          <div>
            {heading && (
              <p
                className={classnames(
                  'mb-2 text-sm font-medium uppercase tracking-widest',
                  descriptionClassName(`variant.${variant}`).toString(),
                )}
              >
                {heading}
              </p>
            )}

            <h1
              className={classnames(
                'text-4xl md:text-5xl font-semibold tracking-tight',
                titleClassName(`variant.${variant}`).toString(),
              )}
            >
              {title}
            </h1>

            {description && (
              <p
                className={classnames(
                  'mt-4 max-w-xl mx-auto',
                  descriptionClassName(`variant.${variant}`).toString(),
                )}
              >
                {description}
              </p>
            )}
          </div>

          {buttonText && (
            <Link
              link={buttonLink}
              locale={locale}
              className="shrink-0"
            >
              <Button
                variant={variant}
                size="m"
              >
                {buttonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
