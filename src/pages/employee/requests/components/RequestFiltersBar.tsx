import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

interface RequestFiltersBarProps {
  month: string;
  search: string;
  onMonthChange: (month: string) => void;
  onSearchChange: (value: string) => void;
  onOpenCreate: () => void;
}

const RequestFiltersBar: React.FC<RequestFiltersBarProps> = ({
  month,
  search,
  onMonthChange,
  onSearchChange,
  onOpenCreate,
}) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-sm border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Month</p>
          <Input type="month" value={month} onChange={(event) => onMonthChange(event.target.value)} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Search</p>
          <div className="relative w-full min-w-[260px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
              placeholder="Search your request details"
            />
          </div>
        </div>
      </div>

      <Button onClick={onOpenCreate}>File Request</Button>
    </div>
  );
};

export default RequestFiltersBar;
