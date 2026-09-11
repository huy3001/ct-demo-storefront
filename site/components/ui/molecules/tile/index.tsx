import Button from '@/components/ui/atoms/button';
import Image, { ImageProps } from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import useClassNames from '@/hooks/useClassNames';
import { Reference } from '@/types/reference';

export interface TileProps {
  image?: ImageProps;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaReference?: Reference;
  roundedBorders?: boolean;
  className?: string;
}

const Tile: React.FC<TileProps> = ({
  image,
  title,
  subtitle,
  ctaLabel,
  ctaReference,
  roundedBorders = true,
  className = '',
}) => {
  const imageClassName = useClassNames([{ 'rounded-sm': roundedBorders }]);

  return (
    <div className={`relative w-full ${className}`}>
      {image && (
        <Image {...image} alt={title} style={{ objectFit: 'cover' }} className={`brightness-75 w-full h-full ${imageClassName}`} />
      )}
      <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 text-center">
        <p className="text-shadow text-center text-sm leading-loose text-white md:text-base lg:font-medium">{subtitle}</p>
        <h2 className="text-shadow mt-4.5 text-center text-2xl font-medium text-white lg:text-3xl">{title}</h2>
        {ctaLabel && (
          <Link link={ctaReference}>
            <Button className="mt-6">
              <span className="text-xs">{ctaLabel}</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Tile;
