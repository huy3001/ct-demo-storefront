import { classnames } from '@/helpers/utils/classnames';
import { TableRowProps } from '../types';

const TableRow = ({ className, ...props }: TableRowProps) => {
  const rowClassName = classnames(
    'whitespace-nowrap grid grid-cols-1 py-3 border-b border-border last:border-b-0 lg:table-row lg:p-0 lg:border-0',
    className,
  );
  return (
    <tr
      className={rowClassName}
      {...props}
    ></tr>
  );
};

export default TableRow;
