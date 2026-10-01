import { TableHTMLAttributes } from 'react';
import { classnames } from '@/helpers/utils/classnames';

const TableHead = ({ className, children, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) => {
  const headClassName = classnames('bg-gray-100 uppercase', className);
  return (
    <thead className={headClassName} {...props}>
      {children}
    </thead>
  );
};

export default TableHead;
