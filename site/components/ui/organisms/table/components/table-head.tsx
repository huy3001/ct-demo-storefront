import { TableHTMLAttributes } from 'react';
import { classnames } from '@/helpers/utils/classnames';

const TableHead = ({ className, children, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) => {
  const headClassName = classnames(
    'bg-cream-dark p-4 hidden font-semibold text-xs text-charcoal-light uppercase lg:table-header-group',
    className,
  );
  return (
    <thead className={headClassName} {...props}>
      {children}
    </thead>
  );
};

export default TableHead;
