import React, { FC } from 'react';
import Image from '@/components/ui/atoms/image';
import Link from '@/components/ui/atoms/link';
import { Tile } from '@/components/ui/organisms/header/types';
import useClassNames from '@/hooks/useClassNames';

export interface Props {
  tileContent: Tile;
}

const HeaderDropdownTile: FC<Props> = ({ tileContent }) => {
  const tileHeaderTextClassName = useClassNames([
    'text-white drop-shadow-xl pb-3.75 text-center text-2xl',
    tileContent?.tileHeaderDecoration,
  ]);
  const tileButtonClassName = useClassNames(['border-b-2 drop-shadow-xl', tileContent?.tileButtonLabelDecoration]);

  return (
    <div className="relative mt-0.5 h-66.25 w-[30%] xl:pl-5">
      <Image
        media={tileContent?.tileImage.media}
        src={tileContent?.tileImage?.media?.file}
        fill
        style={{ objectFit: 'cover' }}
        className="brightness-75"
        alt={tileContent?.tileImage.title ?? ''}
      />
      <div className="absolute left-1/2 top-[42%] h-8.75 w-full -translate-x-1/2 -translate-y-1/2">
        <h3 className={tileHeaderTextClassName}>
          {tileContent?.tileHeaderText}
        </h3>
        <div className="flex justify-center">
          <Link
            variant="primary"
            link={tileContent?.tileButtonLink}
            className={tileButtonClassName}
          >
            <p className="text-xl text-white">{tileContent?.tileButtonLabel}</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeaderDropdownTile;
