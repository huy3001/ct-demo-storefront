import React, { useRef, useState } from 'react';
import HeaderNavigationButtonDesktop from '@/components/ui/organisms/header/header-navigation/header-navigation-desktop/header-navigation-button';
import { Tile } from '@/components/ui/organisms/header/types';
import useClassNames from '@/hooks/useClassNames';
import { useFocusOutside } from '@/hooks/useFocusOutside';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import useScrollDirection from '@/hooks/useScrollDirection';
import { Category } from '@/types/entity/category';
import MenuDropdown from './menu-dropdown';

export interface Props {
  links: Category[];
  tiles: Tile[];
}

const HeaderNavigationDesktop: React.FC<Props> = ({ links, tiles }) => {
  const [activeCategory, setActiveCategory] = useState<Category>();

  const tileContent = tiles.filter((tile) => tile.tileCategory === activeCategory?.name);

  const showSubMenu = (category?: Category) => {
    setActiveCategory(category);
  };
  const hideSubMenu = () => {
    setActiveCategory(undefined);
  };

  const showTimeout = useRef<NodeJS.Timeout | null>(null) as React.MutableRefObject<NodeJS.Timeout | null>;

  const clearShowTimeout = () => {
    if (showTimeout.current) {
      clearTimeout(showTimeout.current);
      showTimeout.current = null;
    }
  };

  const focusMenu = (category: Category) => {
    clearShowTimeout();
    if (activeCategory)
      showSubMenu(category); //Already opened do not delay
    else showTimeout.current = setTimeout(() => showSubMenu(category), 500);
  };

  const blurMenu = () => {
    clearShowTimeout();
    hideSubMenu();
  };

  const scrollDirection = useScrollDirection(5, -1);
  const navigationClassNames = useClassNames([
    'hidden items-center xl:flex duration-150 transition-all pl-11 w-fit',
    scrollDirection === 'down' ? 'h-0 opacity-0 pointer-events-none' : 'h-13 opacity-100 pointer-events-auto',
  ]);

  const { ref } = useFocusOutside(blurMenu);
  useOnClickOutside(ref, blurMenu);

  return (
    <div>
      {links && (
        <div
          className={navigationClassNames}
          onMouseLeave={blurMenu}
          ref={ref}
        >
          <div className="flex w-fit justify-start">
            {links.map((link) => (
              <div
                key={link?.categoryId}
                onMouseEnter={() => focusMenu(link)}
                onFocus={() => focusMenu(link)}
              >
                <HeaderNavigationButtonDesktop
                  show={link.categoryId === activeCategory?.categoryId}
                  link={link}
                  updateSubMenu={hideSubMenu}
                />
              </div>
            ))}
          </div>
          <MenuDropdown
            show={
              !!activeCategory &&
              activeCategory.descendants &&
              activeCategory.descendants.length > 0
            }
            onClick={hideSubMenu}
            links={activeCategory?.descendants ?? []}
            tileContent={tileContent[0]}
          />
        </div>
      )}
    </div>
  );
};

export default HeaderNavigationDesktop;
