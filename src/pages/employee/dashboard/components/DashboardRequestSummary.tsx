import React from 'react';
import { Badge } from '../../../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import type { RequestStatTotals } from '../../shared/employeePortalTypes';

interface DashboardRequestSummaryProps {
  totals: RequestStatTotals;
}

const DashboardRequestSummary: React.FC<DashboardRequestSummaryProps> = ({ totals }) => {
  const rows = [
    {
      label: 'Approved',
      value: totals.approved,
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      label: 'Pending',
      value: totals.pending,
      badgeClass: 'bg-secondary/20 text-secondary-foreground border-secondary/40',
    },
    {
      label: 'Rejected',
      value: totals.rejected,
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  ];

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Request Status (This Month)</CardTitle>
        <CardDescription>Snapshot of your request outcomes and pending items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-sm border p-3">
          <p className="text-xs text-muted-foreground">Total Submitted</p>
          <p className="text-2xl font-semibold">{totals.total}</p>
        </div>

        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-sm border p-3">
            <p className="text-sm font-medium">{row.label}</p>
            <Badge className={row.badgeClass}>{row.value}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DashboardRequestSummary;
