import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Button } from '../../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import type { MemoFilterState, TimeFilter } from '../types';

interface MemoFiltersProps {
  value: MemoFilterState;
  onChange: (next: MemoFilterState) => void;
}

const MemoFilters: React.FC<MemoFiltersProps> = ({ value, onChange }) => {
  const [isMonthModalOpen, setIsMonthModalOpen] = React.useState<boolean>(false);
  const [isYearModalOpen, setIsYearModalOpen] = React.useState<boolean>(false);
  const [isRangeModalOpen, setIsRangeModalOpen] = React.useState<boolean>(false);

  const now = React.useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();

  const [draftMonth, setDraftMonth] = React.useState<string>(value.selectedMonth || String(now.getMonth()));
  const [draftMonthYear, setDraftMonthYear] = React.useState<string>(value.selectedYear || String(currentYear));
  const [draftYear, setDraftYear] = React.useState<string>(value.selectedYear || String(currentYear));
  const [draftRangeStart, setDraftRangeStart] = React.useState<string>(value.rangeStart);
  const [draftRangeEnd, setDraftRangeEnd] = React.useState<string>(value.rangeEnd);

  const update = <K extends keyof MemoFilterState>(key: K, val: MemoFilterState[K]): void => {
    onChange({ ...value, [key]: val });
  };

  const handleTimeChange = (next: TimeFilter): void => {
    if (next === 'month') {
      setDraftMonth(value.selectedMonth || String(now.getMonth()));
      setDraftMonthYear(value.selectedYear || String(currentYear));
      onChange({
        ...value,
        timeFilter: 'month',
        selectedMonth: value.selectedMonth || String(now.getMonth()),
        selectedYear: value.selectedYear || String(currentYear),
      });
      setIsMonthModalOpen(true);
      return;
    }

    if (next === 'year') {
      setDraftYear(value.selectedYear || String(currentYear));
      onChange({
        ...value,
        timeFilter: 'year',
        selectedYear: value.selectedYear || String(currentYear),
      });
      setIsYearModalOpen(true);
      return;
    }

    if (next === 'range') {
      setDraftRangeStart(value.rangeStart);
      setDraftRangeEnd(value.rangeEnd);
      onChange({ ...value, timeFilter: 'range' });
      setIsRangeModalOpen(true);
      return;
    }

    onChange({ ...value, timeFilter: next });
  };

  const monthLabel = React.useMemo(() => {
    const monthIndex = Number.parseInt(value.selectedMonth, 10);
    if (Number.isNaN(monthIndex)) {
      return 'Select month';
    }

    return new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
  }, [value.selectedMonth]);

  const formatDateForLabel = React.useCallback((dateValue: string): string => {
    if (!dateValue) {
      return '';
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(parsed);
  }, []);

  const monthFilterLabel = React.useMemo(() => {
    return `Month (${monthLabel} ${value.selectedYear})`;
  }, [monthLabel, value.selectedYear]);

  const yearFilterLabel = React.useMemo(() => {
    return `Year (${value.selectedYear || 'Select'})`;
  }, [value.selectedYear]);

  const rangeFilterLabel = React.useMemo(() => {
    if (value.rangeStart && value.rangeEnd) {
      return `Date Range (${formatDateForLabel(value.rangeStart)} - ${formatDateForLabel(value.rangeEnd)})`;
    }
    return 'Date Range (Select start and end)';
  }, [formatDateForLabel, value.rangeEnd, value.rangeStart]);

  const saveMonth = (): void => {
    onChange({
      ...value,
      timeFilter: 'month',
      selectedMonth: draftMonth,
      selectedYear: draftMonthYear,
    });
    setIsMonthModalOpen(false);
  };

  const saveYear = (): void => {
    onChange({
      ...value,
      timeFilter: 'year',
      selectedYear: draftYear,
    });
    setIsYearModalOpen(false);
  };

  const saveRange = (): void => {
    onChange({
      ...value,
      timeFilter: 'range',
      rangeStart: draftRangeStart,
      rangeEnd: draftRangeEnd,
    });
    setIsRangeModalOpen(false);
  };

  const monthOptions = Array.from({ length: 12 }).map((_, index) => ({
    value: String(index),
    label: new Date(2000, index, 1).toLocaleString('en-US', { month: 'long' }),
  }));

  const yearOptions = Array.from({ length: 11 }).map((_, offset) => String(currentYear - 5 + offset));

  return (
    <>
      <div className="flex gap-3 rounded-lg border p-3 md:flex-col lg:flex-row">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
            className="pl-9 w-[300px]"
            placeholder="Search type, to, agenda, content"
            value={value.search}
            onChange={(event) => update('search', event.target.value)}
        />
        </div>

        <Select value={value.status} onValueChange={(next) => update('status', next as MemoFilterState['status'])}>
        <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
        </SelectContent>
        </Select>

        <Select value={value.timeFilter} onValueChange={(next) => handleTimeChange(next as TimeFilter)}>
        <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">{monthFilterLabel}</SelectItem>
          <SelectItem value="year">{yearFilterLabel}</SelectItem>
          <SelectItem value="range">{rangeFilterLabel}</SelectItem>
        </SelectContent>
        </Select>
      </div>

      <Dialog open={isMonthModalOpen} onOpenChange={setIsMonthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Month and Year</DialogTitle>
            <DialogDescription>Choose the month and year to filter memos.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Month</Label>
              <Select value={draftMonth} onValueChange={setDraftMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Year</Label>
              <Select value={draftMonthYear} onValueChange={setDraftMonthYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsMonthModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveMonth}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isYearModalOpen} onOpenChange={setIsYearModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Year</DialogTitle>
            <DialogDescription>Choose the year to filter memos.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1">
            <Label>Year</Label>
            <Select value={draftYear} onValueChange={setDraftYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsYearModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveYear}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRangeModalOpen} onOpenChange={setIsRangeModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
            <DialogDescription>Choose the start and end date to filter memos.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={draftRangeStart}
                onChange={(event) => setDraftRangeStart(event.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={draftRangeEnd}
                onChange={(event) => setDraftRangeEnd(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRangeModalOpen(false)}>Cancel</Button>
            <Button
              type="button"
              onClick={saveRange}
              disabled={!draftRangeStart || !draftRangeEnd}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemoFilters;
