import React from 'react';
import { Card, CardContent } from '../../../../../components/ui/card';

interface DashboardStatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: React.ReactNode;
  iconClassName?: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  label,
  value,
  helper,
  icon,
  iconClassName = 'bg-primary/10 text-primary',
}) => {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
        </div>

        <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatCard;
