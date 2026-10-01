import { TableHTMLAttributes, TdHTMLAttributes } from 'react';
import { SelectProps } from '@/components/ui/atoms/select/types';

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  isButtonsCell?: boolean;
  onSorting?: () => void;
  as?: 'th' | 'td';
};

export type TableRowProps = TableHTMLAttributes<HTMLTableRowElement>;

export type TablePaginationProps = {
  className?: string;
  page: number;
  limit: number;
  totalItems: number;
  rowsPerPageOptions?: Array<{ name: string; value: string }>;
  rowsPerPageValue?: string;
  onRowsPerPageChange?: SelectProps['onChange'];
  onPrevious?: () => void;
  onNext?: () => void;
};
