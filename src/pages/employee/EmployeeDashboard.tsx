import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, ClipboardList, Megaphone, TimerReset, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import DashboardMemosPreview from './dashboard/components/DashboardMemosPreview';
import DashboardRequestSummary from './dashboard/components/DashboardRequestSummary';
import DashboardStatCard from './dashboard/components/DashboardStatCard';
import { useEmployeePortal } from './shared/EmployeePortalProvider';
import { useAuth } from '../../context/AuthContext';
import { EmployeeType } from '../../types';
import {
  filterAttendanceByMonth,
  filterRequestsByMonthAndType,
  formatDurationHms,
  getAttendanceStats,
  getCurrentMonthKey,
  getRequestStats,
  getTeachingAttendanceSessionStats,
} from './shared/employeePortalUtils';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { attendanceEntries, requests, memos } = useEmployeePortal();
  const currentMonth = getCurrentMonthKey();
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;
  const isTeaching = employeeType === EmployeeType.TEACHING;

  const monthAttendanceEntries = React.useMemo(() => {
    return filterAttendanceByMonth(attendanceEntries, currentMonth).filter((entry) =>
      isTeaching ? entry.mode === 'TEACHING_SESSION' : entry.mode === 'DAILY',
    );
  }, [attendanceEntries, currentMonth, isTeaching]);

  const attendanceTotals = React.useMemo(() => {
    return getAttendanceStats(monthAttendanceEntries);
  }, [monthAttendanceEntries]);

  const teachingSessionTotals = React.useMemo(() => {
    return getTeachingAttendanceSessionStats(monthAttendanceEntries);
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
        {isTeaching ? (
          <>
            <DashboardStatCard
              label="Teaching Sessions"
              value={String(teachingSessionTotals.totalSessions)}
              helper="Supervisor-marked sessions this month"
              icon={<CalendarClock className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Sessions Present"
              value={String(teachingSessionTotals.present)}
              helper="Sessions marked present"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconClassName="bg-primary/10 text-primary"
            />
            <DashboardStatCard
              label="Appealable Sessions"
              value={String(teachingSessionTotals.appealable)}
              helper="Late or absent marks eligible for appeal"
              icon={<XCircle className="h-5 w-5" />}
              iconClassName="bg-destructive/10 text-destructive"
            />
          </>
        ) : (
          <>
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
          </>
        )}
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
