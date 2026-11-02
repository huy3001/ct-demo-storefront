import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from '@/components/ui/atoms/link';
import useClassNames from '@/hooks/useClassNames';
import { classnames } from '@/helpers/utils/classnames';
import { usePathname } from '@/i18n/routing';
import { FC } from 'react';
import type { Category } from '@/lib/types';

export interface Props {
  show: boolean;
  link: Category;
  updateSubMenu: () => void;
}

const HeaderNavigationButtonDesktop: FC<Props> = ({
  show,
  link,
  updateSubMenu,
}) => {
  const pathname = usePathname();
  const pathnameWithoutQuery = pathname.split('?')[0];

  const linkUrl = `/category/${link.slug}`;

  const isActive = linkUrl === pathnameWithoutQuery;

  const navLinkClassNames = useClassNames([
    'flex py-1 cursor-pointer relative hover:[&>:nth-child(1)]:border-charcoal font-semibold',
  ]);

  return (
    <div
      onClick={updateSubMenu}
      className="h-13 px-2.5 py-3"
    >
      <Link
        link={linkUrl}
        title={link?.name}
        className={navLinkClassNames}
      >
        <span
          className={classnames(
            'block border-b-2',
            show || isActive
              ? 'border-charcoal font-semibold'
              : 'border-transparent',
          )}
        >
          {link?.name}
        </span>
        {link?.children && link?.children.length > 0 && (
          <ChevronDownIcon className="ml-2.5 w-4 text-gray-600" />
        )}
      </Link>
    </div>
  );
};
export default HeaderNavigationButtonDesktop;
