import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import Paginator from '../../reports/requests/components/Paginator';
import ShiftAssignmentCard from './ShiftAssignmentCard';
import type { ShiftCell, ShiftEmployee } from '../types';
import { formatDayHeader, paginate } from '../utils';

interface ShiftAssignmentTableProps {
  employees: ShiftEmployee[];
  weekDates: Date[];
  cellsByEmployee: Record<string, ShiftCell[]>;
}

const PAGE_SIZE = 8;
const FIXED_ROWS = 8;

const ShiftAssignmentTable: React.FC<ShiftAssignmentTableProps> = ({
  employees,
  weekDates,
  cellsByEmployee,
}) => {
  const [page, setPage] = useState<number>(1);

  const { rows: pagedEmployees, totalPages, safePage } = useMemo(
    () => paginate(employees, page, PAGE_SIZE),
    [employees, page],
  );

  React.useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [safePage, page]);

  const renderedRows = pagedEmployees.length === 0 ? 1 : pagedEmployees.length;
  const blankCount = Math.max(0, FIXED_ROWS - renderedRows);

  const initials = (name: string): string =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[255px]">Employee</TableHead>
              {weekDates.map((date) => (
                <TableHead className='text-center border-x' key={date.toISOString()}>{formatDayHeader(date)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagedEmployees.length === 0 ? (
              <TableRow className="h-[77px]">
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              pagedEmployees.map((employee) => (
                <TableRow key={employee.id} className="h-[77px]">
                  <TableCell>
                    <div className="flex items-center gap-3 w-[230px]">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatarUrl} alt={employee.fullName} />
                        <AvatarFallback>{initials(employee.fullName)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{employee.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                  </TableCell>

                  {(cellsByEmployee[employee.id] || []).map((cell) => (
                    <TableCell key={`${employee.id}-${cell.date}`} className="align-top border-x">
                      <ShiftAssignmentCard cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {Array.from({ length: blankCount }, (_, index) => (
              <TableRow key={`blank-shift-row-${index}`} className="h-[77px] border-x">
                {Array.from({ length: 8 }, (_, cellIndex) => (
                  <TableCell key={`blank-shift-cell-${index}-${cellIndex}`}> </TableCell>
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

export default ShiftAssignmentTable;
