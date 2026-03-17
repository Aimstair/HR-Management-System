import React from 'react';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';

interface TardinessFiltersProps {
  search: string;
  month: number;
  year: number;
  onSearchChange: (value: string) => void;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
}

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const years = [2024, 2025, 2026, 2027, 2028];

const TardinessFilters: React.FC<TardinessFiltersProps> = ({
  search,
  month,
  year,
  onSearchChange,
  onMonthChange,
  onYearChange,
}) => {
  return (
    <div className="flex flex-row gap-4">
      <div className="space-y-2">
        <Label>Search Employee</Label>
        <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search name" />
      </div>
      <div className="space-y-2">
        <Label>Month</Label>
        <Select value={String(month)} onValueChange={(value) => onMonthChange(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((item) => (
              <SelectItem key={item.value} value={String(item.value)}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Year</Label>
        <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((item) => (
              <SelectItem key={item} value={String(item)}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TardinessFilters;
