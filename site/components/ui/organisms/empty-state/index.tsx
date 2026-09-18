import React from 'react';
import Button from '@/components/ui/atoms/button';
import Image, { ImageProps } from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import { Link as CategoryLink } from '@/components/ui/organisms/header/types';
import useClassNames from '@/hooks/useClassNames';

type Props = {
  image: ImageProps;
  title: string;
  subtitle: string;
  categories: CategoryLink[];
  className?: string;
  imageClassName?: string;
  handleCategoryClick?: () => void;
};

export const EmptyState: React.FC<Props> = ({
  image,
  title,
  subtitle,
  categories,
  handleCategoryClick,
  className = '',
  imageClassName = '',
}: Props) => {
  const titleClassNames = useClassNames(['py-9 text-center overflow-auto', className]);
  
  const imageClassNames = useClassNames(['relative h-23 w-49.25 px-2.5 text-center md:mb-8 md:mt-13.75', imageClassName]);

  return (
    <div className={titleClassNames}>
      <h6 className="text-center">{title}</h6>
      <div className="hidden w-full justify-center md:flex">
        <div className={imageClassNames}>
          <Image
            media={image?.media}
            src={image?.media?.file}
            fill
            style={{ objectFit: 'contain' }}
            alt={image?.title}
          />
        </div>
      </div>
      <ul className="mt-13.75 flex flex-col items-center gap-y-5">
        <h6 className="text-center">{subtitle}</h6>
        {categories?.map((category) => (
          <li
            key={category.name}
            onClick={handleCategoryClick}
          >
            <Link link={category.reference}>
              <Button
                className="w-50 rounded-md border border-primary text-base text-gray-600"
                variant="secondary"
              >
                {category.name}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
