import React from 'react';
import { Pencil } from 'lucide-react';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import { Button } from '../../../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import type { EmployeeAttendanceEntry } from '../../shared/employeePortalTypes';
import { formatDateLabel, formatTimeLabel } from '../../shared/employeePortalUtils';

interface AttendanceEntriesTableProps {
  entries: EmployeeAttendanceEntry[];
  onEditRequest: (entry: EmployeeAttendanceEntry) => void;
}

const AttendanceEntriesTable: React.FC<AttendanceEntriesTableProps> = ({ entries, onEditRequest }) => {
  return (
    <div className="rounded-sm border">
      <ScrollArea className="h-[430px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No attendance entries found for the selected month.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{formatDateLabel(entry.date)}</TableCell>
                  <TableCell>{formatTimeLabel(entry.timeIn)}</TableCell>
                  <TableCell>{formatTimeLabel(entry.timeOut)}</TableCell>
                  <TableCell>{entry.campus}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onEditRequest(entry)}
                      aria-label="Request attendance edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default AttendanceEntriesTable;
