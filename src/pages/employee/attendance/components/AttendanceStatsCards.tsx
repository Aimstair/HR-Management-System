import React from 'react';
import { Clock3, TimerReset, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '../../../../../components/ui/card';
import type { AttendanceStatTotals } from '../../shared/employeePortalTypes';
import { formatDurationHms } from '../../shared/employeePortalUtils';

interface AttendanceStatsCardsProps {
  totals: AttendanceStatTotals;
}

const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({ totals }) => {
  const items = [
    {
      label: 'Total Work Hours',
      value: formatDurationHms(totals.totalWorkMinutes),
      icon: Clock3,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Late Duration',
      value: formatDurationHms(totals.totalLateMinutes),
      icon: TriangleAlert,
      iconClassName: 'bg-secondary/20 text-secondary-foreground',
    },
    {
      label: 'Total Undertime',
      value: formatDurationHms(totals.totalUndertimeMinutes),
      icon: TimerReset,
      iconClassName: 'bg-destructive/10 text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="py-4">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${item.iconClassName}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AttendanceStatsCards;
