import { FC } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from '@/components/ui/atoms/link';
import useClassNames from '@/hooks/useClassNames';
import type { Category } from '@/lib/types';

export interface Props {
  link: Category;
  categoriesNavigator?: Category[];
  onClick: () => void;
  hideHeaderMenu: () => void;
  isAccountMenu?: boolean;
}

const MobileMenuNavButton: FC<Props> = ({
  link,
  categoriesNavigator,
  onClick,
  hideHeaderMenu,
  isAccountMenu,
}) => {
  const linkClassNames = useClassNames([
    'flex justify-between',
    categoriesNavigator?.length === 0
      ? 'py-4'
      : link?.id === 'myAccount'
        ? 'pb-4'
        : 'pb-8',
  ]);

  const getLinkUrl = (link: Category) => {
    return (categoriesNavigator && categoriesNavigator.length > 0) ||
      isAccountMenu
      ? link.slug
      : `/category/${link.slug}`;
  };

  return (
    <div
      key={link.id}
      className="cursor-pointer"
    >
      {link?.children && link?.children?.length > 0 ? (
        <div
          onClick={onClick}
          className={linkClassNames}
        >
          <p className="text-primary">{link.name}</p>
          <ChevronRightIcon className="w-5 text-gray-600" />
        </div>
      ) : (
        <div
          onClick={hideHeaderMenu}
          className={linkClassNames}
        >
          <Link link={getLinkUrl(link)}>
            <p className="text-primary">{link.name}</p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenuNavButton;
