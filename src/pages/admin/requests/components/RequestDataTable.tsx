import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '../../../../../components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import type { ColumnDefinition, RequestRecord, SortState } from '../types';

interface RequestDataTableProps {
  columns: ColumnDefinition[];
  rows: RequestRecord[];
  selectedIds: Set<string>;
  onToggleAllVisible: (checked: boolean, visibleIds: string[]) => void;
  onToggleOne: (id: string, checked: boolean) => void;
}

const PAGE_SIZE = 10;
const ROW_HEIGHT_CLASS = 'h-[52px]';

const RequestDataTable: React.FC<RequestDataTableProps> = ({
  columns,
  rows,
  selectedIds,
  onToggleAllVisible,
  onToggleOne,
}) => {
  const [sort, setSort] = useState<SortState>({ key: 'requestDate', direction: 'desc' });
  const [page, setPage] = useState<number>(1);

  const sortedRows = useMemo(() => {
    const targetColumn = columns.find((column) => column.id === sort.key);
    if (!targetColumn || !targetColumn.sortable) {
      return rows;
    }

    const getValue = targetColumn.sortValue || ((request: RequestRecord) => request.id);

    return [...rows].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sort.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const result = String(valueA).localeCompare(String(valueB));
      return sort.direction === 'asc' ? result : -result;
    });
  }, [columns, rows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = sortedRows.slice(start, start + PAGE_SIZE);
  const blankRows = Math.max(0, PAGE_SIZE - paginated.length);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  React.useEffect(() => {
    setPage(1);
  }, [rows, sort]);

  const visibleIds = paginated.map((row) => row.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleChecked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleChecked = selectedVisibleCount > 0 && !allVisibleChecked;

  const toggleSort = (key: string): void => {
    setSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortIcon = (columnId: string, sortable?: boolean): React.ReactNode => {
    if (!sortable) {
      return null;
    }
    if (sort.key !== columnId) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sort.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3 h-full">
      <div className="border-b">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[44px]">
                <Checkbox
                  checked={allVisibleChecked ? true : someVisibleChecked ? 'indeterminate' : false}
                  onCheckedChange={(checked) => onToggleAllVisible(Boolean(checked), visibleIds)}
                />
              </TableHead>

              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 ${column.sortable ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => (column.sortable ? toggleSort(column.id) : undefined)}
                  >
                    {column.label}
                    {sortIcon(column.id, column.sortable)}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.id} className={ROW_HEIGHT_CLASS}>
                <TableCell className={`${ROW_HEIGHT_CLASS} overflow-hidden align-middle`}>
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={(checked) => onToggleOne(row.id, Boolean(checked))}
                  />
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    key={`${row.id}-${column.id}`}
                    className={`${ROW_HEIGHT_CLASS} overflow-hidden align-middle ${column.className || ''}`}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {Array.from({ length: blankRows }, (_, index) => (
              <TableRow key={`blank-${index}`} className={ROW_HEIGHT_CLASS}>
                <TableCell className={`${ROW_HEIGHT_CLASS} overflow-hidden align-middle`}>&nbsp;</TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={`blank-${index}-${column.id}`}
                    className={`${ROW_HEIGHT_CLASS} overflow-hidden align-middle ${column.className || ''}`}
                  >
                    &nbsp;
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination className='h-full p-4 mt-0 pt-0'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              size="default"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setPage((current) => Math.max(1, current - 1));
              }}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                size="icon"
                href="#"
                isActive={safePage === pageNumber}
                onClick={(event) => {
                  event.preventDefault();
                  setPage(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              size="default"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setPage((current) => Math.min(totalPages, current + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default RequestDataTable;
