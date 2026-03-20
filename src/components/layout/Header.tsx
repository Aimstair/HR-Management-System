import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import ThemeToggle from '../ThemeToggle';

/**
 * Header Component
 * Displays page title, search bar, and notifications
 */
const Header: React.FC = () => {
  const location = useLocation();

  // Get page title from route
    const getScreenMeta = (): { title: string; description: string } => {
      const routeMap: Record<string, { title: string; description: string }> = {
        '/portal/dashboard': {
          title: 'Dashboard',
          description: 'Overview of your attendance, requests, and performance updates.',
        },
        '/portal/profile': {
          title: 'My Profile',
          description: 'View and manage your personal and employment details.',
        },
        '/portal/attendance': {
          title: 'Attendance',
          description: 'Track your daily logs, schedules, and attendance history.',
        },
        '/portal/requests': {
          title: 'My Requests',
          description: 'Submit and monitor leave, adjustment, and other HR requests.',
        },
        '/portal/evaluations': {
          title: 'Evaluations',
          description: 'Review evaluation results and progress insights.',
        },
        '/admin/dashboard': {
          title: 'Dashboard',
          description: 'Campus-wide HR snapshot with key workforce indicators.',
        },
        '/admin/employees': {
          title: 'Employees',
          description: 'Manage employee records, assignments, and onboarding data.',
        },
        '/admin/organization': {
          title: 'Organization',
          description: 'View organizational structure by school, department, and campus.',
        },
        '/admin/requests': {
          title: 'Request Management',
          description: 'Review and process employee HR requests across campuses.',
        },
        '/admin/shifts': {
          title: 'Shift Management',
          description: 'Configure work shifts, schedules, and timing rules.',
        },
        '/admin/memo': {
          title: 'Memo Management',
          description: 'Create, filter, and review employee memos with acknowledgements.',
        },
        '/admin/reports/attendance': {
          title: 'Attendance Report',
          description: 'Analyze attendance logs, DTR details, and attendance trends.',
        },
        '/admin/reports/tardiness': {
          title: 'Tardiness Report',
          description: 'Monitor daily punctuality statuses with monthly tardiness matrix.',
        },
        '/admin/reports': {
          title: 'Reports',
          description: 'Access attendance and tardiness reporting tools.',
        },
        '/admin/reports/requests/leave': {
          title: 'Leave Report',
          description: 'Review leave filings by employee with actions and add-leave workflow.',
        },
        '/admin/reports/requests/expense': {
          title: 'Expense Report',
          description: 'Review employee expense filings with totals and processing status.',
        },
        '/admin/reports/requests/fund': {
          title: 'Fund Request Report',
          description: 'Track fund requests, payables, deductions, and payment progress.',
        },
        '/admin/reports/requests/overtime': {
          title: 'Overtime Report',
          description: 'Monitor overtime request trends and processing outcomes.',
        },
        '/admin/reports/requests/undertime': {
          title: 'Undertime Report',
          description: 'Monitor undertime request filings and approvals.',
        },
        '/admin/reports/requests/wfh': {
          title: 'Work from Home Report',
          description: 'Track work-from-home request filings and statuses.',
        },
        '/admin/reports/requests/time-adjustment': {
          title: 'Time Adjustment Report',
          description: 'Track time adjustment requests and processing details.',
        },
        '/admin/reports/requests/shift-assignment': {
          title: 'Shift Assignment Report',
          description: 'Track shift assignment request activity and status.',
        },
        '/admin/reports/requests/swap-request': {
          title: 'Swap Request Report',
          description: 'Track schedule swap requests and decision history.',
        },
      };

      if (location.pathname.startsWith('/admin/employees')) {
        return {
          title: 'Employees',
          description: 'Manage employee records, assignments, and onboarding data.',
        };
      }

      if (location.pathname.startsWith('/admin/reports/attendance')) {
        return {
          title: 'Attendance Report',
          description: 'Analyze attendance logs, DTR details, and attendance trends.',
        };
      }

      if (location.pathname.startsWith('/admin/reports/tardiness')) {
        return {
          title: 'Tardiness Report',
          description: 'Monitor daily punctuality statuses with monthly tardiness matrix.',
        };
      }

      if (location.pathname.startsWith('/admin/reports/requests')) {
        const requestRouteMeta: Array<{ path: string; title: string; description: string }> = [
          {
            path: '/admin/reports/requests/leave',
            title: 'Leave Report',
            description: 'Review leave filings by employee with actions and add-leave workflow.',
          },
          {
            path: '/admin/reports/requests/expense',
            title: 'Expense Report',
            description: 'Review employee expense filings with totals and processing status.',
          },
          {
            path: '/admin/reports/requests/fund',
            title: 'Fund Request Report',
            description: 'Track fund requests, payables, deductions, and payment progress.',
          },
          {
            path: '/admin/reports/requests/overtime',
            title: 'Overtime Report',
            description: 'Monitor overtime request trends and processing outcomes.',
          },
          {
            path: '/admin/reports/requests/undertime',
            title: 'Undertime Report',
            description: 'Monitor undertime request filings and approvals.',
          },
          {
            path: '/admin/reports/requests/wfh',
            title: 'Work from Home Report',
            description: 'Track work-from-home request filings and statuses.',
          },
          {
            path: '/admin/reports/requests/time-adjustment',
            title: 'Time Adjustment Report',
            description: 'Track time adjustment requests and processing details.',
          },
          {
            path: '/admin/reports/requests/shift-assignment',
            title: 'Shift Assignment Report',
            description: 'Track shift assignment request activity and status.',
          },
          {
            path: '/admin/reports/requests/swap-request',
            title: 'Swap Request Report',
            description: 'Track schedule swap requests and decision history.',
          },
        ];

        const matched = requestRouteMeta.find((item) => location.pathname.startsWith(item.path));
        if (matched) {
          return {
            title: matched.title,
            description: matched.description,
          };
        }

        return {
          title: 'Requests Report',
          description: 'Browse and analyze leave, expense, fund, and schedule-related requests.',
        };
      }

      if (location.pathname.startsWith('/admin/memo')) {
        return {
          title: 'Memo Management',
          description: 'Create, filter, and review employee memos with acknowledgements.',
        };
      }

      return (
        routeMap[location.pathname] || {
          title: 'HR Management System',
          description: 'Manage people operations, attendance, requests, and reports.',
        }
      );
    };

    const { title, description } = getScreenMeta();

    return (
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          <ThemeToggle />
        </div>
      </header>
    );
  };

export default Header;
