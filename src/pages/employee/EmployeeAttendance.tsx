import React from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import AttendanceEditRequestDialog from './attendance/components/AttendanceEditRequestDialog';
import AttendanceEntriesTable from './attendance/components/AttendanceEntriesTable';
import AttendanceStatsCards from './attendance/components/AttendanceStatsCards';
import { useEmployeePortal } from './shared/EmployeePortalProvider';
import type { EmployeeAttendanceEntry } from './shared/employeePortalTypes';
import {
  filterAttendanceByMonth,
  getAttendanceStats,
  getCurrentMonthKey,
} from './shared/employeePortalUtils';

const EmployeeAttendance: React.FC = () => {
  const { attendanceEntries, submitAttendanceEditRequest } = useEmployeePortal();
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonthKey());
  const [selectedEntry, setSelectedEntry] = React.useState<EmployeeAttendanceEntry | null>(null);

  const monthEntries = React.useMemo(() => {
    return filterAttendanceByMonth(attendanceEntries, selectedMonth);
  }, [attendanceEntries, selectedMonth]);

  const attendanceTotals = React.useMemo(() => {
    return getAttendanceStats(monthEntries);
  }, [monthEntries]);

  const handleSubmitAttendanceEdit = React.useCallback(
    (payload: { timeIn: string; timeOut: string; reason: string }) => {
      if (!selectedEntry) {
        return;
      }

      const record = submitAttendanceEditRequest({
        attendanceEntryId: selectedEntry.id,
        timeIn: payload.timeIn,
        timeOut: payload.timeOut,
        reason: payload.reason,
      });

      if (!record) {
        toast.error('Unable to file attendance edit request. Please try again.');
        return;
      }

      setSelectedEntry(null);
      toast.success('Attendance edit request filed as pending.');
    },
    [selectedEntry, submitAttendanceEditRequest],
  );

  return (
    <div className="space-y-6">
      <AttendanceStatsCards totals={attendanceTotals} />

      <Card className="py-4">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Attendance Entries</CardTitle>
            <CardDescription>
              List view is fixed-height and shows date, time in, time out, and campus.
            </CardDescription>
          </div>

          <div className="w-full max-w-55 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Month</p>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceEntriesTable entries={monthEntries} onEditRequest={setSelectedEntry} />
        </CardContent>
      </Card>

      <AttendanceEditRequestDialog
        open={Boolean(selectedEntry)}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onSubmit={handleSubmitAttendanceEdit}
      />
    </div>
  );
};

export default EmployeeAttendance;
