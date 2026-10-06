import { classnames } from '@/helpers/utils/classnames';
import TableCell from './table-cell';
import { TableCellProps } from '../types';

const TableHeaderCell = ({ className, children, ...props }: TableCellProps) => {
  const headClassName = classnames(
    'whitespace-pre text-left',
    className,
  );

  return (
    <TableCell
      as="th"
      className={headClassName}
      {...props}
    >
      {children}
    </TableCell>
  );
};

export default TableHeaderCell;
