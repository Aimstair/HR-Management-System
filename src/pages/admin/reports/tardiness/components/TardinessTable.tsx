import React, { useMemo, useState } from 'react';
import { Badge } from '../../../../../../components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../components/ui/table';
import type { MonthDay, TardinessEmployeeRow, TardinessStatus } from '../types';
import { statusByKey } from '../utils';
import { ScrollArea, ScrollBar } from '../../../../../../components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../../../../components/ui/tooltip';

interface TardinessTableProps {
  monthDays: MonthDay[];
  rows: TardinessEmployeeRow[];
  activeStatuses: Set<TardinessStatus>;
}

const PAGE_SIZE = 10;

const initials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
};

const formatLongDate = (isoDate: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date(isoDate));
};

const formatTime = (isoTime?: string): string => {
  if (!isoTime) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoTime));
};

const formatDuration = (minutes?: number): string => {
  if (minutes === undefined || minutes <= 0) {
    return 'N/A';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const TardinessTable: React.FC<TardinessTableProps> = ({ monthDays, rows, activeStatuses }) => {
  const [page, setPage] = useState<number>(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = rows.slice(start, start + PAGE_SIZE);
  const blankRows = Math.max(0, PAGE_SIZE - paginated.length);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const statusHeader = useMemo(
    () => [
      { key: 'early', label: 'Early', badgeClass: 'border-blue-200 bg-blue-100 text-blue-800' },
      { key: 'on-time', label: 'On Time', badgeClass: 'border-emerald-200 bg-emerald-100 text-emerald-800' },
      { key: 'late', label: 'Late', badgeClass: 'border-amber-200 bg-amber-100 text-amber-800' },
      { key: 'on-leave', label: 'On Leave', badgeClass: 'border-pink-200 bg-pink-100 text-pink-800' },
      { key: 'absent', label: 'Absent', badgeClass: 'border-red-200 bg-red-100 text-red-800' },
    ] as const,
    [],
  );

  return (
    <div className="relative overflow-hidden rounded-md">
      <ScrollArea className="overflow-hidden">
        <Table className='z-40 rounded-none'>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="sticky left-0 z-10 min-w-[200px] bg-primary/10 border">Employee</TableHead>
              <TableHead className="sticky left-[200px] z-10 min-w-[170px] bg-primary/10 text-center border">Summary</TableHead>
              {monthDays.map((day) => (
                <TableHead key={day.isoDate} className="min-w-[45px] text-center text-xs py-1 border">
                    <div className='flex flex-col items-center justify-center leading-[1.1] gap-1'>
                        <span className='text-[8px] uppercase'>{day.monthLabel}</span>
                        <span className='text-xs font-bold'>{day.dayLabel}</span>
                        <span className='text-[8px] uppercase'>{day.weekdayLabel}</span>
                    </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((row) => (
              <TableRow key={row.employeeId}>
                <TableCell className="sticky left-0 z-10 bg-background">
                  <div className="flex items-center gap-3">
                    {row.avatarUrl ? (
                      <img src={row.avatarUrl} alt={row.employeeName} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {initials(row.employeeName)}
                      </div>
                    )}
                    <span className="font-medium">{row.employeeName}</span>
                  </div>
                </TableCell>

                <TableCell className="sticky left-[200px] z-10 bg-background">
                  <div className="flex flex-wrap gap-1 items-center justify-center">
                    {statusHeader.map((item) => (
                      <Badge key={item.key} variant="outline" className={`text-xs w-6 h-6 ${item.badgeClass}`}>
                        {row.summary[item.key]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                {monthDays.map((day) => {
                  const status = row.statusesByDate[day.isoDate];
                  const statusMeta = statusByKey[status];
                  const detail = row.dayDetailsByDate[day.isoDate];
                  const shouldPaint = activeStatuses.has(status);
                  return (
                    <Tooltip key={`${row.employeeId}-${day.isoDate}`}>
                      <TooltipTrigger asChild>
                        <TableCell
                          className={`cursor-help text-center text-xs border font-medium transition-all duration-300 ${shouldPaint ? statusMeta.cellClass : 'bg-transparent text-muted-foreground'}`}
                        >
                          {statusMeta.shortLabel}
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6} className="w-[220px] space-y-1 text-xs">
                        <p><span className="font-semibold">Date:</span> {formatLongDate(detail.isoDate)}</p>
                        <p><span className="font-semibold">Status:</span> {statusMeta.label}</p>
                        <p><span className="font-semibold">Time In:</span> {formatTime(detail.timeIn)}</p>
                        <p><span className="font-semibold">Time Out:</span> {formatTime(detail.timeOut)}</p>
                        <p><span className="font-semibold">Work Duration:</span> {formatDuration(detail.workMinutes)}</p>
                        <p><span className="font-semibold">Early Duration:</span> {formatDuration(detail.earlyMinutes)}</p>
                        <p><span className="font-semibold">Late Duration:</span> {formatDuration(detail.lateMinutes)}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}

            {Array.from({ length: blankRows }, (_, index) => (
              <TableRow key={`blank-${index}`} className='h-[2.55rem]'>
                <TableCell className="sticky left-0 z-10 bg-background">-</TableCell>
                <TableCell className="sticky left-[200px] z-10 bg-background text-center">-</TableCell>
                {monthDays.map((day) => (
                  <TableCell key={`blank-${index}-${day.isoDate}`} className='border text-center'>-</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <Pagination className='p-2 border-t'>
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

export default TardinessTable;
