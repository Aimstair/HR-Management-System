import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardList, Megaphone, TimerReset } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import DashboardMemosPreview from './dashboard/components/DashboardMemosPreview';
import DashboardRequestSummary from './dashboard/components/DashboardRequestSummary';
import DashboardStatCard from './dashboard/components/DashboardStatCard';
import { useEmployeePortal } from './shared/EmployeePortalProvider';
import {
  filterAttendanceByMonth,
  filterRequestsByMonthAndType,
  formatDurationHms,
  getAttendanceStats,
  getCurrentMonthKey,
  getRequestStats,
} from './shared/employeePortalUtils';

const EmployeeDashboard: React.FC = () => {
  const { attendanceEntries, requests, memos } = useEmployeePortal();
  const currentMonth = getCurrentMonthKey();

  const monthAttendanceEntries = React.useMemo(() => {
    return filterAttendanceByMonth(attendanceEntries, currentMonth);
  }, [attendanceEntries, currentMonth]);

  const attendanceTotals = React.useMemo(() => {
    return getAttendanceStats(monthAttendanceEntries);
  }, [monthAttendanceEntries]);

  const monthRequests = React.useMemo(() => {
    return filterRequestsByMonthAndType(requests, currentMonth).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }, [currentMonth, requests]);

  const requestTotals = React.useMemo(() => {
    return getRequestStats(monthRequests);
  }, [monthRequests]);

  const latestMemos = React.useMemo(() => {
    return [...memos]
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
      .slice(0, 3);
  }, [memos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-end gap-3">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/portal/attendance">
              <CalendarClock className="h-4 w-4" />
              Attendance
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/portal/memos">
              <Megaphone className="h-4 w-4" />
              Memos
            </Link>
          </Button>
          <Button asChild>
            <Link to="/portal/requests">
              <ClipboardList className="h-4 w-4" />
              Requests
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardStatCard
          label="Total Work Hours"
          value={formatDurationHms(attendanceTotals.totalWorkMinutes)}
          helper="Computed from this month attendance entries"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Total Late Duration"
          value={formatDurationHms(attendanceTotals.totalLateMinutes)}
          helper="Accumulated late duration this month"
          icon={<TimerReset className="h-5 w-5" />}
          iconClassName="bg-secondary/20 text-secondary-foreground"
        />
        <DashboardStatCard
          label="Total Undertime"
          value={formatDurationHms(attendanceTotals.totalUndertimeMinutes)}
          helper="Undertime total for selected month"
          icon={<TimerReset className="h-5 w-5" />}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardMemosPreview memos={latestMemos} />
        <DashboardRequestSummary totals={requestTotals} />
      </div>

      <Card className="py-4">
        <CardHeader>
          <CardTitle>Recent Requests Filed</CardTitle>
          <CardDescription>Your latest request activity for this month.</CardDescription>
        </CardHeader>
        <CardContent>
          {monthRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests filed this month.</p>
          ) : (
            <div className="space-y-2">
              {monthRequests.slice(0, 4).map((request) => (
                <div key={request.id} className="rounded-sm border p-3">
                  <p className="text-sm font-medium">{request.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filed on {new Date(request.submittedAt).toLocaleString('en-US')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
