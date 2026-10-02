import { TableHTMLAttributes } from 'react';
import { classnames } from '@/helpers/utils/classnames';

const TableBody = ({ className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) => {
  const bodyClassName = classnames('text-sm', className);

  return <tbody className={bodyClassName} {...props} />;
};

export default TableBody;
