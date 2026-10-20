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
import { useAuth } from '../../context/AuthContext';
import { EmployeeType } from '../../types';
import type { EmployeeAttendanceEntry } from './shared/employeePortalTypes';
import {
  filterAttendanceByMonth,
  getAttendanceStats,
  getCurrentMonthKey,
  getTeachingAttendanceSessionStats,
} from './shared/employeePortalUtils';

const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const { attendanceEntries, submitAttendanceEditRequest } = useEmployeePortal();
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonthKey());
  const [selectedEntry, setSelectedEntry] = React.useState<EmployeeAttendanceEntry | null>(null);
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;
  const isTeaching = employeeType === EmployeeType.TEACHING;

  const monthEntries = React.useMemo(() => {
    return filterAttendanceByMonth(attendanceEntries, selectedMonth);
  }, [attendanceEntries, selectedMonth]);

  const visibleEntries = React.useMemo(() => {
    if (isTeaching) {
      return attendanceEntries
        .filter((entry) => entry.mode === 'TEACHING_SESSION')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return monthEntries.filter((entry) => entry.mode === 'DAILY');
  }, [attendanceEntries, isTeaching, monthEntries]);

  const attendanceTotals = React.useMemo(() => {
    return getAttendanceStats(visibleEntries);
  }, [visibleEntries]);

  const teachingSessionTotals = React.useMemo(() => {
    return getTeachingAttendanceSessionStats(visibleEntries);
  }, [visibleEntries]);

  const handleSubmitAttendanceEdit = React.useCallback(
    async (payload: { timeIn: string; timeOut: string; reason: string }) => {
      if (!selectedEntry) {
        return;
      }

      if (isTeaching && selectedEntry.status !== 'LATE' && selectedEntry.status !== 'ABSENT') {
        toast.error('Appeals are available only for Late or Absent session marks.');
        return;
      }

      try {
        const record = await submitAttendanceEditRequest({
          attendanceEntryId: selectedEntry.id,
          timeIn: payload.timeIn,
          timeOut: payload.timeOut,
          reason: payload.reason,
        });

        if (!record) {
          throw new Error('Attendance record not found.');
        }

        setSelectedEntry(null);
        toast.success(
          isTeaching
            ? 'Attendance appeal sent to HR for review.'
            : 'Attendance edit request sent to HR for review.',
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Please try again.';
        toast.error(`Unable to file attendance ${isTeaching ? 'appeal' : 'edit request'}: ${message}`);
      }
    },
    [isTeaching, selectedEntry, submitAttendanceEditRequest],
  );

  return (
    <div className="space-y-6">
      <AttendanceStatsCards totals={attendanceTotals} sessionTotals={isTeaching ? teachingSessionTotals : undefined} />

      <Card className="py-4">
        {!isTeaching && (
          <CardHeader className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Attendance Entries</CardTitle>
              <CardDescription>
                {isTeaching
                  ? 'Session-based supervisor attendance marks (Present, Late, Absent, Holiday).'
                  : 'Daily attendance entries showing date, time in, time out, and campus.'}
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
        )}
        <CardContent>
          <AttendanceEntriesTable
            employeeType={employeeType}
            entries={visibleEntries}
            onDailyEditRequest={setSelectedEntry}
            onTeachingAppeal={setSelectedEntry}
          />
        </CardContent>
      </Card>

      <AttendanceEditRequestDialog
        open={Boolean(selectedEntry)}
        entry={selectedEntry}
        title={isTeaching ? 'Attendance Appeal' : 'Request Attendance Edit'}
        description={
          isTeaching
            ? 'File an appeal for a Late or Absent teaching session mark.'
            : undefined
        }
        onClose={() => setSelectedEntry(null)}
        onSubmit={handleSubmitAttendanceEdit}
      />
    </div>
  );
};

export default EmployeeAttendance;
