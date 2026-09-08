import React, { FC, useEffect, useRef } from 'react';
import Link from '@/components/ui/atoms/link';
import { Tile } from '@/components/ui/organisms/header/types';
import useClassNames from '@/hooks/useClassNames';
import HeaderDropdownTile from './header-menu-tile';
import { usePathname } from '@/i18n/routing';
import { classnames } from '@/helpers/utils/classnames';
import type { Category } from '@/lib/types';

export interface Props {
  show: boolean | undefined;
  links: Category[];
  tileContent?: Tile;
  onClick?: () => void;
}

const MenuDropdown: FC<Props> = ({ show, links, tileContent, onClick }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const wrapperClassNames = useClassNames([
    'transition absolute flex justify-between bottom-0 left-0 duration-300 ease-in-out min-h-75 w-[100%] translate-y-full',
    show
      ? 'opacity-100 z-20 delay-300'
      : 'opacity-0 z-[-999] pointer-events-none',
    'border-b-2 border-t-2 border-b-accent border-t-neutral-400 bg-white pl-13 pr-13 py-8',
  ]);

  const linksClassNames = useClassNames([
    'grid grid-cols-4 gap-x-29 gap-y-7',
    tileContent ? 'pr-29' : '',
  ]);
  useEffect(() => {
    if (show && links?.length) {
      ref.current?.focus();
    }
  }, [show, links]);

  const pathname = usePathname();
  const pathnameWithoutQuery = pathname.split('?')[0];

  const getLinkUrl = (link: Category) => {
    return `/category/${link.slug}`;
  };

  const getLinkClassName = (link: Category) => {
    return classnames('whitespace-nowrap', {
      'underline underline-offset-2 font-semibold':
        `/category/${link.slug}` === pathnameWithoutQuery,
    });
  };

  return (
    <div className={wrapperClassNames}>
      <ul className={linksClassNames}>
        {links?.map((link, index) => (
          <li key={link.id}>
            {link.children && link.children.length > 0 ? (
              <>
                <div className="w-min pb-2">
                  <Link
                    link={getLinkUrl(link)}
                    ref={index === 0 ? ref : null}
                    variant="menu-header"
                    className={getLinkClassName(link)}
                  >
                    <p className="text-sm">{link.name}</p>
                  </Link>
                </div>
                {link.children.map((field) => (
                  <div
                    key={field.id}
                    className="w-min pb-2"
                  >
                    <Link
                      link={getLinkUrl(field)}
                      onClick={onClick}
                      variant="menu-item"
                      className={getLinkClassName(field)}
                    >
                      <p className="text-sm">{field.name}</p>
                    </Link>
                  </div>
                ))}
              </>
            ) : (
              <Link
                key={link.id}
                link={getLinkUrl(link)}
                variant="menu-header"
                className={getLinkClassName(link)}
              >
                <p className="text-sm">{link.name}</p>
              </Link>
            )}
          </li>
        ))}
      </ul>
      {tileContent && <HeaderDropdownTile tileContent={tileContent} />}
    </div>
  );
};

export default MenuDropdown;
