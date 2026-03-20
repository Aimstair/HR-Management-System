import type {
  ShiftCell,
  ShiftEmployee,
  ShiftOverride,
  ShiftTemplate,
  Weekday,
} from './types';

const WEEKDAY_SHORT: Record<Weekday, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export const toDateKey = (date: Date): string => {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

export const getWeekday = (date: Date): Weekday => {
  const map: Record<number, Weekday> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  return map[date.getDay()];
};

const getCurrentWeekStart = (): Date => {
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const day = localToday.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  localToday.setDate(localToday.getDate() + diffToMonday);
  return localToday;
};

export const getWeekDates = (weekOffset: number): Date[] => {
  const start = getCurrentWeekStart();
  start.setDate(start.getDate() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export const formatDayHeader = (date: Date): string => {
  const weekday = getWeekday(date);
  return `${WEEKDAY_SHORT[weekday]} ${date.getDate()}`;
};

export const formatWeekRange = (weekDates: Date[]): string => {
  if (weekDates.length === 0) {
    return '';
  }
  const first = weekDates[0];
  const last = weekDates[weekDates.length - 1];

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(first)} - ${formatter.format(last)}`;
};

export const isDateToday = (date: Date): boolean => {
  return toDateKey(date) === toDateKey(new Date());
};

export const getShiftLabel = (shift: ShiftTemplate | null): string => {
  if (!shift) {
    return 'Rest Day';
  }
  return `${shift.startTime} - ${shift.endTime}`;
};

export const getDaysIncludedLabel = (days: Weekday[]): string => {
  if (days.length === 0) {
    return 'No schedule';
  }
  return days.map((day) => WEEKDAY_SHORT[day]).join(', ');
};

export const paginate = <T,>(
  items: T[],
  page: number,
  pageSize: number,
): { rows: T[]; totalPages: number; safePage: number } => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: items.slice(start, start + pageSize),
    totalPages,
    safePage,
  };
};

export const enumerateDateRange = (startDate: string, endDate: string): string[] => {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  if (end < start) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export const buildWeekCells = (
  employees: ShiftEmployee[],
  shifts: ShiftTemplate[],
  overrides: ShiftOverride[],
  weekDates: Date[],
): Record<string, ShiftCell[]> => {
  const shiftMap = new Map(shifts.map((shift) => [shift.id, shift]));
  const overrideMap = new Map(overrides.map((item) => [`${item.employeeId}|${item.date}`, item]));

  const result: Record<string, ShiftCell[]> = {};

  employees.forEach((employee) => {
    result[employee.id] = weekDates.map((date) => {
      const dateKey = toDateKey(date);
      const weekday = getWeekday(date);
      const override = overrideMap.get(`${employee.id}|${dateKey}`);

      if (override) {
        return {
          employeeId: employee.id,
          date: dateKey,
          status: override.status,
          shift: shiftMap.get(override.shiftId) || null,
          isToday: isDateToday(date),
        };
      }

      const defaultShift = shiftMap.get(employee.defaultShiftId) || null;
      const shiftIsActive = defaultShift?.daysIncluded.includes(weekday) || false;
      const isRestDay = weekday === 'Saturday' || weekday === 'Sunday' || !shiftIsActive;

      return {
        employeeId: employee.id,
        date: dateKey,
        status: isRestDay ? 'rest-day' : 'default',
        shift: isRestDay ? null : defaultShift,
        isToday: isDateToday(date),
      };
    });
  });

  return result;
};
