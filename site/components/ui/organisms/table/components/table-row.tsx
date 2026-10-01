import { classnames } from '@/helpers/utils/classnames';
import { TableRowProps } from '../types';

const TableRow = ({ className, ...props }: TableRowProps) => {
  const rowClassName = classnames('whitespace-nowrap', className);
  return (
    <tr
      className={rowClassName}
      {...props}
    ></tr>
  );
};

export default TableRow;
