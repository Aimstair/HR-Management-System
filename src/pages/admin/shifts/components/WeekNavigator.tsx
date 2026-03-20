import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

interface WeekNavigatorProps {
  weekRangeLabel: string;
  weekOffset: number;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weekRangeLabel,
  weekOffset,
  onPrevious,
  onNext,
  onToday,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious} aria-label="Previous week">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <p className="min-w-45 text-sm font-medium">{weekRangeLabel}</p>

        <Button variant="outline" size="icon" onClick={onNext} aria-label="Next week">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="secondary" onClick={onToday} disabled={weekOffset === 0}>
        Today
      </Button>
    </div>
  );
};

export default WeekNavigator;
