import React from 'react';
import { cn } from '../../../../lib/utils';
import type { ShiftCell } from '../types';
import { getDaysIncludedLabel, getShiftLabel } from '../utils';

interface ShiftAssignmentCardProps {
  cell: ShiftCell;
}

const ShiftAssignmentCard: React.FC<ShiftAssignmentCardProps> = ({ cell }) => {
  const visualStatus = cell.isToday ? 'today' : cell.status;

  return (
    <div
      className={cn(
        'rounded-sm shadow-md border p-[5px] text-center text-xs w-[180px]',
        visualStatus === 'today' && 'border-orange-300 bg-orange-100 text-orange-900',
        visualStatus === 'default' && 'border-border bg-transparent text-foreground',
        visualStatus === 'console-assigned' && 'border-emerald-300 bg-emerald-100 text-emerald-900',
        visualStatus === 'employee-requested' && 'border-pink-300 bg-pink-100 text-pink-900',
        visualStatus === 'rest-day' && 'border-slate-300 bg-slate-200 text-slate-700',
      )}
    >
      <p className="font-bold">{cell.shift?.name || 'Rest Day'}</p>
      <p className="truncate">{getShiftLabel(cell.shift)}</p>
      <p className="truncate opacity-90 uppercase">{getDaysIncludedLabel(cell.shift?.daysIncluded || [])}</p>
    </div>
  );
};

export default ShiftAssignmentCard;
