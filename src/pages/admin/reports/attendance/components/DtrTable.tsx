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
import { EmployeeType } from '../../../../../types';

interface DtrTableProps {
  entries: DtrEntry[];
  isHr: boolean;
  onEditEntry: (entry: DtrEntry) => void;
  employeeType: EmployeeType;
}

const NON_TEACHING_PAGE_SIZE = 11;
const TEACHING_PAGE_SIZE = 8;

const DtrTable: React.FC<DtrTableProps> = ({ entries, isHr, onEditEntry, employeeType }) => {
  const [page, setPage] = useState<number>(1);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime());
  }, [entries]);
  const pageSize = employeeType === EmployeeType.TEACHING ? TEACHING_PAGE_SIZE : NON_TEACHING_PAGE_SIZE;
  const rowHeightClass = employeeType === EmployeeType.TEACHING ? 'h-[72.6px]' : 'h-[3.3rem]';

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);
  const blankRowCount = Math.max(0, pageSize - paginated.length);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <>
      <Card className='flex flex-col p-0 gap-0'>
        <div className="border-b">
          <Table>
            <TableHeader>
              <TableRow>
                {employeeType === EmployeeType.TEACHING ? (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    {isHr ? <TableHead className="w-22.5">Action</TableHead> : null}
                  </>
                ) : (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Time Out</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Work Hours</TableHead>
                    {isHr ? <TableHead className="w-22.5">Action</TableHead> : null}
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((entry) => {
                const lateMinutes = computeLateMinutes(entry);
                const workMinutes = computeWorkMinutes(entry);
                return (
                  <TableRow key={entry.id} className={rowHeightClass}>
                    {employeeType === EmployeeType.TEACHING ? (
                      <>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium">{entry.subjectCode ?? '--'}</p>
                            <p className="text-xs text-muted-foreground">{entry.subjectName ?? 'N/A'}</p>
                            {entry.semester ? <p className="text-[11px] text-muted-foreground">{entry.semester}</p> : null}
                          </div>
                        </TableCell>
                        <TableCell>{`${formatDateTime(entry.timeIn)} - ${formatDateTime(entry.timeOut)}`}</TableCell>
                        {/* <TableCell>
                          <div className="space-y-0.5">
                            <p>{formatDateTime(entry.timeIn)}</p>
                            <p>{formatDateTime(entry.timeOut)}</p>
                          </div>
                        </TableCell> */}
                        <TableCell className="max-w-72 truncate" title={entry.remarks ?? 'N/A'}>
                          {entry.remarks ?? 'N/A'}
                        </TableCell>
                        <TableCell>
                          {entry.attendanceStatus ? (
                            <Badge className="bg-primary/10 text-primary">{entry.attendanceStatus}</Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">N/A</Badge>
                          )}
                        </TableCell>
                        {isHr ? (
                          <TableCell>
                            <Button type="button" size="icon" variant="outline" onClick={() => onEditEntry(entry)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        ) : null}
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </TableRow>
                );
              })}
              {Array.from({ length: blankRowCount }, (_, index) => (
                <TableRow key={`blank-${index}`} className={rowHeightClass}>
                  {employeeType === EmployeeType.TEACHING ? (
                    <>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      {isHr ? <TableCell>-</TableCell> : null}
                    </>
                  ) : (
                    <>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      {isHr ? <TableCell>-</TableCell> : null}
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination className='p-[14px]'>
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
      </Card>

        
    </>
  );
};

export default DtrTable;
