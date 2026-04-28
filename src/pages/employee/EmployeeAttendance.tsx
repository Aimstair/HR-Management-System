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
    (payload: { timeIn: string; timeOut: string; reason: string }) => {
      if (isTeaching) {
        if (!selectedEntry) {
          return;
        }

        const status = selectedEntry.status;
        if (status !== 'LATE' && status !== 'ABSENT') {
          toast.error('Appeals are available only for Late or Absent session marks.');
          return;
        }

        const record = submitAttendanceEditRequest({
          attendanceEntryId: selectedEntry.id,
          timeIn: payload.timeIn,
          timeOut: payload.timeOut,
          reason: payload.reason,
        });

        if (!record) {
          toast.error('Unable to file attendance appeal. Please try again.');
          return;
        }

        setSelectedEntry(null);
        toast.success('Attendance appeal filed for supervisor review.');
        return;
      }

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
