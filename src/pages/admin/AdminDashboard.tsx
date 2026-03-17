import React from 'react';
import { Activity, BellRing, ClipboardList, UserPlus, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface KpiMetric {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
}

interface ActivityFeedItem {
  id: string;
  message: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

const kpiMetrics: KpiMetric[] = [
  {
    label: 'Total Staff',
    value: 142,
    icon: Users,
    accentClass: 'text-primary bg-primary/10',
  },
  {
    label: 'Pending Requests',
    value: 15,
    icon: ClipboardList,
    accentClass: 'text-secondary-foreground bg-secondary/20',
  },
  {
    label: 'Absent Today',
    value: 4,
    icon: UserX,
    accentClass: 'text-destructive bg-destructive/10',
  },
];

const activityFeed: ActivityFeedItem[] = [
  {
    id: 'ACT-001',
    message: 'Expense request REQ-1003 approved for Michael Chen.',
    timestamp: '5 minutes ago',
    icon: ClipboardList,
  },
  {
    id: 'ACT-002',
    message: 'New hire onboarded: Angela Cruz (Registrar).',
    timestamp: '22 minutes ago',
    icon: UserPlus,
  },
  {
    id: 'ACT-003',
    message: 'Shift swap request REQ-1015 reviewed by HR.',
    timestamp: '1 hour ago',
    icon: Activity,
  },
  {
    id: 'ACT-004',
    message: 'Leave request REQ-1001 moved to approved status.',
    timestamp: '2 hours ago',
    icon: ClipboardList,
  },
];

const AdminDashboard: React.FC = () => {
  const triggerQuickAction = (actionLabel: string): void => {
    toast.success(`${actionLabel} queued successfully.`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Admin Command Center</h1>
        <p className="text-sm text-muted-foreground">
          Monitor workforce health, recent actions, and operational shortcuts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpiMetrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-3xl font-bold">{metric.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${metric.accentClass}`}>
                  <MetricIcon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity Feed</CardTitle>
            <CardDescription>
              Latest approvals, onboarding events, and scheduling updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((item) => {
              const ItemIcon = item.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border p-3"
                >
                  <div className="rounded-md bg-muted p-2">
                    <ItemIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.message}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks with one-click triggers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => triggerQuickAction('Payroll report generation')}
            >
              Generate Payroll Report
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => triggerQuickAction('New employee workflow')}
            >
              Add New Employee
            </Button>
            <Button
              className="w-full justify-start"
              variant="secondary"
              onClick={() => triggerQuickAction('Announcement broadcast')}
            >
              <BellRing className="h-4 w-4" />
              Broadcast Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
