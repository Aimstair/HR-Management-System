import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Ellipsis,
  FileClock,
  Megaphone,
  UserCheck,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

interface KpiStats {
  totalEmployees: number;
  onLeave: number;
  pendingRequests: number;
  todayAttendance: number;
  totalLate: number;
}

interface AttendanceTrendPoint {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  present: number;
  absent: number;
  late: number;
}

interface RequestBreakdownPoint {
  name: 'Leave' | 'Funds' | 'Overtime' | 'Shift Swap';
  value: number;
}

interface TardinessWatchItem {
  id: string;
  avatarUrl: string;
  name: string;
  department: string;
  minutesLate: number;
}

interface PriorityRequestItem {
  id: string;
  avatarUrl: string;
  name: string;
  requestType: 'Leave' | 'Funds' | 'Overtime' | 'Shift Swap';
  dateSubmitted: string;
}

interface KpiCard {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}

const PRIMARY_COLOR = '#0D3E20';
const ACCENT_COLOR = '#FEB104';

const kpiStats: KpiStats = {
  totalEmployees: 342,
  onLeave: 12,
  pendingRequests: 18,
  todayAttendance: 94,
  totalLate: 8,
};

const attendanceTrendData: AttendanceTrendPoint[] = [
  { day: 'Mon', present: 320, absent: 15, late: 7 },
  { day: 'Tue', present: 326, absent: 10, late: 6 },
  { day: 'Wed', present: 318, absent: 17, late: 9 },
  { day: 'Thu', present: 324, absent: 12, late: 8 },
  { day: 'Fri', present: 322, absent: 13, late: 7 },
  { day: 'Sat', present: 301, absent: 24, late: 11 },
  { day: 'Sun', present: 298, absent: 26, late: 12 },
];

const requestBreakdownData: RequestBreakdownPoint[] = [
  { name: 'Leave', value: 45 },
  { name: 'Funds', value: 25 },
  { name: 'Overtime', value: 20 },
  { name: 'Shift Swap', value: 10 },
];

const tardinessWatchlist: TardinessWatchItem[] = [
  {
    id: 'TW-001',
    avatarUrl: 'https://picsum.photos/seed/tardy-1/80/80',
    name: 'Angela Cruz',
    department: 'Registrar',
    minutesLate: 36,
  },
  {
    id: 'TW-002',
    avatarUrl: 'https://picsum.photos/seed/tardy-2/80/80',
    name: 'Michael Chen',
    department: 'Human Resources',
    minutesLate: 29,
  },
  {
    id: 'TW-003',
    avatarUrl: 'https://picsum.photos/seed/tardy-3/80/80',
    name: 'Sara Tan',
    department: 'Finance',
    minutesLate: 24,
  },
  {
    id: 'TW-004',
    avatarUrl: 'https://picsum.photos/seed/tardy-4/80/80',
    name: 'Carlos Mendoza',
    department: 'Operations',
    minutesLate: 19,
  },
];

const priorityRequests: PriorityRequestItem[] = [
  {
    id: 'PR-001',
    avatarUrl: 'https://picsum.photos/seed/priority-1/80/80',
    name: 'John Smith',
    requestType: 'Leave',
    dateSubmitted: '2026-03-20',
  },
  {
    id: 'PR-002',
    avatarUrl: 'https://picsum.photos/seed/priority-2/80/80',
    name: 'Emma Davis',
    requestType: 'Funds',
    dateSubmitted: '2026-03-20',
  },
  {
    id: 'PR-003',
    avatarUrl: 'https://picsum.photos/seed/priority-3/80/80',
    name: 'Grace Lim',
    requestType: 'Overtime',
    dateSubmitted: '2026-03-19',
  },
  {
    id: 'PR-004',
    avatarUrl: 'https://picsum.photos/seed/priority-4/80/80',
    name: 'Ian Flores',
    requestType: 'Shift Swap',
    dateSubmitted: '2026-03-19',
  },
];

const pieColors: string[] = [PRIMARY_COLOR, '#2D6A4F', '#6AA58D', ACCENT_COLOR];

const kpiCards: KpiCard[] = [
  {
    label: 'Active Headcount',
    value: String(kpiStats.totalEmployees - kpiStats.onLeave),
    helper: `${kpiStats.onLeave} currently on leave`,
    icon: UserCheck,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    label: 'Pending Approvals',
    value: String(kpiStats.pendingRequests),
    helper: 'Across all request modules',
    icon: FileClock,
    iconClassName: 'text-black',
  },
  {
    label: "Today's Attendance %",
    value: `${kpiStats.todayAttendance}%`,
    helper: 'Organization attendance rate today',
    icon: CheckCircle2,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    label: 'Flagged Tardy',
    value: String(kpiStats.totalLate),
    helper: 'Employees marked late today',
    icon: AlertCircle,
    iconClassName: 'bg-destructive/10 text-destructive',
  },
];

const AdminDashboard: React.FC = () => {
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const initials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-3xl font-bold">{metric.value}</p>
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
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>7-Day Attendance Trend</CardTitle>
            <CardDescription>
              Present vs absent trend for the last seven days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke={PRIMARY_COLOR}
                  fill="url(#presentGradient)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="absent"
                  stroke={ACCENT_COLOR}
                  fill={`${ACCENT_COLOR}33`}
                  strokeWidth={2}
                />
              </AreaChart>
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
                  label
                >
                  {requestBreakdownData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
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
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                    <AvatarFallback>{initials(item.name)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.requestType} • Submitted {item.dateSubmitted}
                    </p>
                  </div>

                  <Badge variant="outline" style={{ backgroundColor: `${ACCENT_COLOR}33`, borderColor: ACCENT_COLOR, color: '#5C4200' }}>
                    Pending
                  </Badge>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open Request</DropdownMenuItem>
                    <DropdownMenuItem>Approve</DropdownMenuItem>
                    <DropdownMenuItem>Decline</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Tardiness Watchlist</CardTitle>
            <CardDescription>Employees flagged late and requiring follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tardinessWatchlist.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                    <AvatarFallback>{initials(item.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.department}</p>
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
