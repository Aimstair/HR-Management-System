import React, { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../components/ui/pagination';
import type { DtrEntry } from '../types';
import { computeLateMinutes, computeWorkMinutes, formatDate, formatDateTime, formatDuration } from '../utils';
import { Card } from '../../../../../../components/ui/card';

interface DtrTableProps {
  entries: DtrEntry[];
  isHr: boolean;
  onEditEntry: (entry: DtrEntry) => void;
}

const PAGE_SIZE = 11;

const DtrTable: React.FC<DtrTableProps> = ({ entries, isHr, onEditEntry }) => {
  const [page, setPage] = useState<number>(1);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime());
  }, [entries]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = sorted.slice(start, start + PAGE_SIZE);
  const blankRowCount = Math.max(0, PAGE_SIZE - paginated.length);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <>
      <Card className='flex flex-col p-0'>
        {paginated.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendance records found for this filter.</p>
        ) : null}
        <div className="rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Work Hours</TableHead>
                {isHr ? <TableHead className="w-[90px]">Action</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((entry) => {
                const lateMinutes = computeLateMinutes(entry);
                const workMinutes = computeWorkMinutes(entry);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.shift}</TableCell>
                    <TableCell>{formatDateTime(entry.timeIn)}</TableCell>
                    <TableCell>{formatDateTime(entry.timeOut)}</TableCell>
                    <TableCell>
                      {lateMinutes > 0 ? (
                        <Badge className="bg-secondary/20 text-secondary-foreground">{formatDuration(lateMinutes)}</Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary">On Time</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDuration(workMinutes)}</TableCell>
                    {isHr ? (
                      <TableCell>
                        <Button type="button" size="icon" variant="outline" onClick={() => onEditEntry(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
              {Array.from({ length: blankRowCount }, (_, index) => (
                <TableRow key={`blank-${index}`}  className="h-[3.3rem]">
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  {isHr ? <TableCell>-</TableCell> : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

        <Pagination>
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
    </>
  );
};

export default DtrTable;
