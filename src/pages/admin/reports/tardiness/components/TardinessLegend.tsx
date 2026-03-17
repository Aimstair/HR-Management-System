import React from 'react';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { LEGEND_ITEMS } from '../mockData';
import type { TardinessStatus } from '../types';

interface TardinessLegendProps {
  activeStatuses: Set<TardinessStatus>;
  onToggle: (status: TardinessStatus) => void;
}

const TardinessLegend: React.FC<TardinessLegendProps> = ({ activeStatuses, onToggle }) => {
  return (
    <div className="flex flex-wrap gap-2 top-[40px] right-[130px] absolute">
      {LEGEND_ITEMS.map((item) => {
        const active = activeStatuses.has(item.key);
        const badgeColor = active ? item.badgeClass : 'bg-muted text-muted-foreground border-muted';
        return (
            <Badge key={item.key} onClick={() => onToggle(item.key)} className={`border transition-all hover:scale-105 active:scale-95 cursor-pointer ${badgeColor}`}>{item.label}</Badge>
        );
      })}
    </div>
  );
};

export default TardinessLegend;
