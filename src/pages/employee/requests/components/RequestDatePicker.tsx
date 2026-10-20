import React from 'react';
import { CalendarIcon } from 'lucide-react';
import type { Matcher } from 'react-day-picker';
import { Button } from '../../../../../components/ui/button';
import { Calendar } from '../../../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover';
import { cn } from '../../../../lib/utils';

interface RequestDatePickerProps {
  id: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  allowWeekends?: boolean;
  minDate?: string; // YYYY-MM-DD
  disabled?: boolean;
  placeholder?: string;
}

const fromDateKey = (value: string): Date | undefined => {
  const [year, month, day] = value.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : undefined;
};

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatLabel = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);

const RequestDatePicker: React.FC<RequestDatePickerProps> = ({
  id,
  value,
  onChange,
  allowWeekends = false,
  minDate,
  disabled = false,
  placeholder = 'Select a date',
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = value ? fromDateKey(value) : undefined;
  const minimum = minDate ? fromDateKey(minDate) : undefined;

  const disabledDays = React.useMemo<Matcher[]>(() => {
    const matchers: Matcher[] = [];
    if (!allowWeekends) {
      matchers.push({ dayOfWeek: [0, 6] });
    }
    if (minimum) {
      matchers.push({ before: minimum });
    }
    return matchers;
  }, [allowWeekends, minimum?.getTime()]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn('w-full justify-start font-normal', !selected && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? formatLabel(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minimum}
          disabled={disabledDays}
          onSelect={(date) => {
            if (date) {
              onChange(toDateKey(date));
              setOpen(false);
            }
          }}
        />
        {!allowWeekends ? (
          <p className="border-t px-3 py-2 text-xs text-muted-foreground">Weekends are not available for this request.</p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

export default RequestDatePicker;
