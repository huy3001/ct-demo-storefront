import { useMemo } from 'react';
import { classnames } from '@/helpers/utils/classnames';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { TableCellProps } from '../types';

const TableCell = ({
  className,
  sortable,
  isButtonsCell = false,
  onSorting,
  children = ' ',
  as = 'td',
  cellHeading,
  ...props
}: TableCellProps) => {
  const Cell = as;
  const isHeadCell = as === 'th';

  const cellClassName = classnames(
    'flex gap-1 items-center py-1 text-left lg:p-4 lg:table-cell',
    { 'cursor-pointer': !!sortable },
    {
      'sticky right-0 z-10': isButtonsCell,
    },
    { 'text-right': typeof children == 'number' },
    className,
  );

  const asTypography = useMemo(
    () => (
      <span
        className={classnames(
          { 'text-xs font-semibold': isHeadCell },
          { 'text-sm font-normal': !isHeadCell },
        )}
      >
        {children as string}
      </span>
    ),
    [children, isHeadCell],
  );

  const childrenContainer = useMemo(() => {
    if (sortable) {
      return (
        <button onClick={onSorting} className="flex gap-2">
          {asTypography}
          <ChevronUpDownIcon className="hidden size-5 stroke-gray-500 lg:block" />
        </button>
      );
    } else if (typeof children === 'string') return asTypography;
    else return children;
  }, [asTypography, children, onSorting, sortable]);

  return (
    <Cell className={cellClassName} {...props}>
      {cellHeading && (
        <span className="w-1/4 shrink-0 font-semibold text-xs text-charcoal-light lg:hidden">
          {cellHeading}
        </span>
      )}
      {childrenContainer}
    </Cell>
  );
};

export default TableCell;
