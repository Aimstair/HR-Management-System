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
  pageSize = 10,
  fixedRows = 10,
}: GenericReportTableProps<T>): React.ReactElement => {
  const [page, setPage] = useState<number>(1);

  const { rows: paginated, totalPages, safePage } = useMemo(() => paginate(rows, page, pageSize), [rows, page, pageSize]);

  React.useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const renderedDataRows = paginated.length === 0 ? 1 : paginated.length;
  const blankCount = Math.max(0, fixedRows - renderedDataRows);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden border-b">
        <Table className=''>
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
                <TableCell colSpan={columns.length} className="h-14.5 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, index) => (
                <TableRow key={`row-${index}`} className="h-14.5">
                  {columns.map((column) => (
                    <TableCell key={`${column.id}-${index}`} className={column.className}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {Array.from({ length: blankCount }, (_, index) => (
              <TableRow key={`blank-${index}`} className="h-14.5">
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
