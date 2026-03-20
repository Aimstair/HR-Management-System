import React from 'react';
import { Badge } from '../../../../../components/ui/badge';

const items = [
  { label: 'Today', className: 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-100' },
  { label: 'Default Shift', className: 'bg-transparent text-foreground border-border hover:bg-transparent' },
  { label: 'Console Assigned Shift', className: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-100' },
  { label: 'Employee Requested Shift', className: 'bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-100' },
  { label: 'Rest Day', className: 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200' },
];

const ShiftStatusLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item.label} variant="outline" className={item.className}>
          {item.label}
        </Badge>
      ))}
    </div>
  );
};

export default ShiftStatusLegend;
