import React, { useMemo } from 'react';
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
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 11;
const ROW_HEIGHT_CLASS = 'h-[57px]';

const   RequestDataTable: React.FC<RequestDataTableProps> = ({
  columns,
  rows,
  selectedIds,
  onToggleAllVisible,
  onToggleOne,
  sort,
  onSortChange,
  page,
  totalPages,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
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

  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const blankRows = Math.max(0, pageSize - sortedRows.length);
  const paginationPages = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (safePage <= 2) {
      return [1, 2, 3];
    }

    if (safePage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [safePage - 1, safePage, safePage + 1];
  }, [safePage, totalPages]);

  const visibleIds = sortedRows.map((row) => row.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleChecked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleChecked = selectedVisibleCount > 0 && !allVisibleChecked;

  const toggleSort = (key: string): void => {
    onSortChange(
      sort.key === key
        ? { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
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
            {sortedRows.map((row) => (
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
                onPageChange(Math.max(1, safePage - 1));
              }}
            />
          </PaginationItem>
          {paginationPages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                size="icon"
                href="#"
                isActive={safePage === pageNumber}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(pageNumber);
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
                onPageChange(Math.min(totalPages, safePage + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default RequestDataTable;
