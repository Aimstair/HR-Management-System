import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../../../components/ui/input';

interface EmployeeMemoFiltersProps {
  month: string;
  search: string;
  onMonthChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const EmployeeMemoFilters: React.FC<EmployeeMemoFiltersProps> = ({
  month,
  search,
  onMonthChange,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-sm border p-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Month</p>
        <Input type="month" value={month} onChange={(event) => onMonthChange(event.target.value)} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Search</p>
        <div className="relative min-w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
            placeholder="Search memo agenda or content"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeMemoFilters;
