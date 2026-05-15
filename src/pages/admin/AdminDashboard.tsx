import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  ClipboardList,
  Clock3,
  Ellipsis,
  FileClock,
  Megaphone,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '../../../components/ui/toggle-group';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getAdminDashboardSummary, type AdminDashboardSummary } from '../../lib/admin-api';

type AttendanceTrendPoint = AdminDashboardSummary['attendanceTrendNonTeaching'][number];
type RequestBreakdownPoint = AdminDashboardSummary['requestBreakdown'][number];
type TardinessWatchItem = AdminDashboardSummary['tardinessWatchlist'][number];
type PriorityRequestItem = AdminDashboardSummary['priorityRequests'][number];

interface KpiCard {
  label: string;
  value: string;
  helper: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}

const PRIMARY_COLOR = '#0D3E20';
const ACCENT_COLOR = '#FEB104';

const emptySummary: AdminDashboardSummary['summary'] = {
  totalEmployees: 0,
  totalTeachingEmployees: 0,
  totalNonTeachingEmployees: 0,
  teachingActive: 0,
  nonTeachingActive: 0,
  teachingSessionsPresent: 0,
  teachingSessionsTotal: 0,
  todayTeachingSessionsAttendance: 0,
  onLeave: 0,
  pendingRequests: 0,
  todayAttendance: 0,
  todayTeachingAttendance: 0,
  todayNonTeachingAttendance: 0,
  totalLate: 0,
  activeShifts: 0,
};

const pieColors: string[] = [PRIMARY_COLOR, '#2D6A4F', '#6AA58D', ACCENT_COLOR];

const renderPieLabel = (props: PieLabelRenderProps): string => {
  const name = typeof props.name === 'string' ? props.name : 'Other';
  const value = typeof props.value === 'number' ? props.value : 0;
  return `${name} (${value})`;
};

const AdminDashboard: React.FC = () => {
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<'non-teaching' | 'teaching'>('non-teaching');
  const navigate = useNavigate();

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const shortDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  useEffect(() => {
    const loadDashboardSummary = async (): Promise<void> => {
      try {
        const summary = await getAdminDashboardSummary();
        setDashboardSummary(summary);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load admin dashboard summary');
      }
    };

    void loadDashboardSummary();
  }, []);

  const summary = dashboardSummary?.summary ?? emptySummary;
  const attendanceTrendData: AttendanceTrendPoint[] =
    attendanceMode === 'teaching'
      ? dashboardSummary?.attendanceTrendTeaching ?? []
      : dashboardSummary?.attendanceTrendNonTeaching ?? [];
  const requestBreakdownData: RequestBreakdownPoint[] = dashboardSummary?.requestBreakdown ?? [];
  const priorityRequests: PriorityRequestItem[] = dashboardSummary?.priorityRequests ?? [];
  const tardinessWatchlist: TardinessWatchItem[] = dashboardSummary?.tardinessWatchlist ?? [];

  const kpiCards: KpiCard[] = useMemo(() => {
    const teachingRatio =
      summary.teachingSessionsTotal > 0
        ? `${summary.teachingSessionsPresent}/${summary.teachingSessionsTotal}`
        : '0/0';
    const nonTeachingRatio =
      summary.totalNonTeachingEmployees > 0
        ? `${summary.nonTeachingActive}/${summary.totalNonTeachingEmployees}`
        : '0/0';

    return [
      {
        label: 'Teaching Sessions',
        value: `${teachingRatio} (${summary.todayTeachingSessionsAttendance}%)`,
        helper: 'Sessions with teachers present today',
        to: '/admin/reports/attendance',
        icon: UserCheck,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'Non-Teaching Headcount',
        value: `${nonTeachingRatio} (${summary.todayNonTeachingAttendance}%)`,
        helper: 'Active non-teaching staff today',
        to: '/admin/reports/tardiness',
        icon: Users,
        iconClassName: 'bg-emerald-100 text-emerald-700',
      },
      {
        label: 'On Leave',
        value: String(summary.onLeave),
        helper: 'Employees currently on leave',
        to: '/admin/reports/requests/leave',
        icon: Clock3,
        iconClassName: 'bg-amber-100 text-amber-600',
      },
      {
        label: 'Pending Approvals',
        value: String(summary.pendingRequests),
        helper: 'Requests awaiting approval',
        to: '/admin/requests',
        icon: FileClock,
        iconClassName: 'text-black',
      },
      {
        label: 'Flagged Tardy',
        value: String(summary.totalLate),
        helper: 'Employees marked late today',
        to: '/admin/reports/tardiness',
        icon: AlertCircle,
        iconClassName: 'bg-destructive/10 text-destructive',
      },
    ];
  }, [summary]);

  const attendanceDescription =
    attendanceMode === 'teaching'
      ? 'Present vs absent teaching sessions for the last seven days.'
      : 'Present vs absent non-teaching staff for the last seven days.';
  const presentLegendLabel = attendanceMode === 'teaching' ? 'Present' : 'Present Staff';
  const absentLegendLabel = attendanceMode === 'teaching' ? 'Absent' : 'Absent Staff';
  const formatTrendTick = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(parsed);
  };
  const formatTrendTooltip = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  };

  const requestRouteMap: Record<RequestBreakdownPoint['name'], string> = {
    Leave: '/admin/reports/requests/leave',
    Undertime: '/admin/reports/requests/undertime',
    Overtime: '/admin/reports/requests/overtime',
    'Work from Home': '/admin/reports/requests/wfh',
    'Time Adjustment': '/admin/reports/requests/time-adjustment',
  };

  const handleRequestBreakdownClick = (entry: RequestBreakdownPoint): void => {
    const route = requestRouteMap[entry.name];
    if (route) {
      navigate(route);
    }
  };

  const handleOpenRequest = (requestId: string): void => {
    navigate(`/admin/requests?requestId=${requestId}`);
  };

  const handleOpenEmployee = (employeeId: string): void => {
    navigate(`/admin/employees?employeeId=${employeeId}`);
  };

  const initials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatShortDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: PRIMARY_COLOR }}>
            HR Command Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/admin/memo">
              <Megaphone className="h-4 w-4" />
              Draft Memo
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/reports/attendance">
              <ClipboardList className="h-4 w-4" />
              Generate Report
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <Link key={metric.label} to={metric.to} className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-2xl font-bold">{metric.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${metric.iconClassName}`}
                    style={metric.label === 'Pending Approvals' ? { backgroundColor: `${ACCENT_COLOR}33`, color: ACCENT_COLOR } : undefined}
                  >
                    <MetricIcon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>7-Day Attendance Trend</CardTitle>
                <CardDescription>{attendanceDescription}</CardDescription>
              </div>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                className="w-50"
                value={attendanceMode}
                onValueChange={(value) => {
                  if (value === 'non-teaching' || value === 'teaching') {
                    setAttendanceMode(value);
                  }
                }}
              >
                <ToggleGroupItem value="non-teaching">Non-Teaching</ToggleGroupItem>
                <ToggleGroupItem value="teaching">Teaching</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={formatTrendTick} />
                <YAxis />
                <Tooltip labelFormatter={(value) => formatTrendTooltip(String(value))} />
                <Legend verticalAlign="top" height={24} iconType="circle" />
                <Line
                  type="linear"
                  dataKey="present"
                  name={presentLegendLabel}
                  stroke={PRIMARY_COLOR}
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="absent"
                  name={absentLegendLabel}
                  stroke={ACCENT_COLOR}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pending Requests Breakdown</CardTitle>
            <CardDescription>Distribution of request types pending action.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderPieLabel}
                >
                  {requestBreakdownData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={pieColors[index % pieColors.length]}
                      onClick={() => handleRequestBreakdownClick(entry)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority Request Inbox</CardTitle>
            <CardDescription>
              Pending requests requiring HR review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorityRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/40 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenRequest(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleOpenRequest(item.id);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.avatarUrl ?? undefined} alt={item.name} />
                    <AvatarFallback>{initials(item.name)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.requestType} • Submitted {formatShortDate(item.dateSubmitted)}
                    </p>
                  </div>

                  <Badge variant="outline" style={{ backgroundColor: `${ACCENT_COLOR}33`, borderColor: ACCENT_COLOR, color: '#5C4200' }}>
                    Pending
                  </Badge>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      Decline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{`Today's Tardiness Watchlist (${shortDate})`}</CardTitle>
            <CardDescription>Employees flagged late and requiring follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tardinessWatchlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/40 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenEmployee(item.employeeId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleOpenEmployee(item.employeeId);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.avatarUrl ?? undefined} alt={item.name} />
                    <AvatarFallback>{initials(item.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.department ?? 'Unassigned'}</p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-destructive">{item.minutesLate} min late</p>
              </div>
            ))}

            <div className="pt-2">
              <Button variant="link" asChild className="px-0" style={{ color: PRIMARY_COLOR }}>
                <Link to="/admin/reports/tardiness">
                  <Clock3 className="h-4 w-4" />
                  View Full Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
