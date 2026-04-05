import React from 'react';
import { CheckCircle2, Clock4, ListChecks, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../../../../components/ui/card';
import type { RequestStatTotals } from '../../shared/employeePortalTypes';

interface RequestStatsCardsProps {
  totals: RequestStatTotals;
}

const RequestStatsCards: React.FC<RequestStatsCardsProps> = ({ totals }) => {
  const cards = [
    {
      label: 'Total',
      value: totals.total,
      icon: ListChecks,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: 'Approved',
      value: totals.approved,
      icon: CheckCircle2,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: 'Pending',
      value: totals.pending,
      icon: Clock4,
      iconClassName: 'bg-secondary/20 text-secondary-foreground',
    },
    {
      label: 'Rejected',
      value: totals.rejected,
      icon: XCircle,
      iconClassName: 'bg-destructive/10 text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="py-4">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${card.iconClassName}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RequestStatsCards;
