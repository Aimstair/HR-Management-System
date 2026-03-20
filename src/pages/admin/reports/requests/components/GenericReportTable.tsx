import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../components/ui/table';
import { paginate } from '../utils';
import Paginator from './Paginator';

interface GenericReportColumn<T> {
  id: string;
  label: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface GenericReportTableProps<T> {
  rows: T[];
  columns: GenericReportColumn<T>[];
  emptyMessage: string;
  pageSize?: number;
  fixedRows?: number;
}

const GenericReportTable = <T,>({
  rows,
  columns,
  emptyMessage,
  pageSize = 8,
  fixedRows = 8,
}: GenericReportTableProps<T>): React.ReactElement => {
  const [page, setPage] = useState<number>(1);

  const { rows: paginated, totalPages, safePage } = useMemo(() => paginate(rows, page, pageSize), [rows, page, pageSize]);

  React.useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const blankCount = Math.max(0, fixedRows - paginated.length);

  return (
    <div className="space-y-3">
      <div className="h-[520px] overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[80px] text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, index) => (
                <TableRow key={`row-${index}`} className="h-[58px]">
                  {columns.map((column) => (
                    <TableCell key={`${column.id}-${index}`} className={column.className}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {Array.from({ length: blankCount }, (_, index) => (
              <TableRow key={`blank-${index}`} className="h-[58px]">
                {columns.map((column) => (
                  <TableCell key={`blank-${column.id}-${index}`}> </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Paginator currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default GenericReportTable;
