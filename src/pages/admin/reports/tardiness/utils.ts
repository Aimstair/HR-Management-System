import type { DtrEntry, ReportEmployee } from '../types';
import { computeLateMinutes, computeWorkMinutes } from '../utils';
import { HOLIDAY_DATES, LEAVE_DATES_BY_EMPLOYEE, LEGEND_ITEMS } from './mockData';
import type { MonthDay, TardinessEmployeeRow, TardinessStatus } from './types';

const SHIFT_START_MINUTES: Record<string, number> = {
  Morning: 8 * 60,
  Mid: 9 * 60,
  Night: 22 * 60,
  Flexible: 10 * 60,
};

const toMinutesFromDate = (iso: string): number => {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
};

export const statusByKey = LEGEND_ITEMS.reduce<Record<TardinessStatus, (typeof LEGEND_ITEMS)[number]>>(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<TardinessStatus, (typeof LEGEND_ITEMS)[number]>,
);

const getDaysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

export const makeMonthDays = (year: number, month: number): MonthDay[] => {
  const days = getDaysInMonth(year, month);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;

    return {
      isoDate,
      dayLabel: date.toLocaleString('en-US', { day: '2-digit' }),
      monthLabel: date.toLocaleString('en-US', { month: 'short' }),
      weekdayLabel: date.toLocaleString('en-US', { weekday: 'short' }),
    };
  });
};

const dtrLookup = (entries: DtrEntry[]): Record<string, DtrEntry> => {
  const map: Record<string, DtrEntry> = {};
  entries.forEach((entry) => {
    map[`${entry.employeeId}_${entry.date}`] = entry;
  });
  return map;
};

const deterministicPick = (employeeId: string, isoDate: string): number => {
  const raw = `${employeeId}-${isoDate}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) % 997;
  }
  return hash % 10;
};

const inferStatus = (
  employeeId: string,
  isoDate: string,
  entry: DtrEntry | undefined,
  nowIsoDate: string,
): TardinessStatus => {
  if (isoDate > nowIsoDate) {
    return 'unrendered';
  }

  if (HOLIDAY_DATES.includes(isoDate)) {
    return 'holiday';
  }

  const day = new Date(isoDate).getDay();
  if (day === 0 || day === 6) {
    return 'day-off';
  }

  if ((LEAVE_DATES_BY_EMPLOYEE[employeeId] || []).includes(isoDate)) {
    return 'on-leave';
  }

  if (entry) {
    const lateMinutes = computeLateMinutes(entry);
    if (lateMinutes === 0) {
      const timeIn = new Date(entry.timeIn);
      const minutesFromMidnight = timeIn.getHours() * 60 + timeIn.getMinutes();
      if (minutesFromMidnight <= 8 * 60 - 5) {
        return 'early';
      }
      return 'on-time';
    }
    return 'late';
  }

  const pick = deterministicPick(employeeId, isoDate);
  if (pick <= 1) {
    return 'on-leave';
  }
  return 'absent';
};

export const buildTardinessRows = (
  employees: ReportEmployee[],
  entries: DtrEntry[],
  monthDays: MonthDay[],
): TardinessEmployeeRow[] => {
  const map = dtrLookup(entries);
  const nowIsoDate = new Date().toISOString().slice(0, 10);

  return employees.map((employee) => {
    const statusesByDate: Record<string, TardinessStatus> = {};
    const dayDetailsByDate: TardinessEmployeeRow['dayDetailsByDate'] = {};
    const summary = {
      early: 0,
      'on-time': 0,
      late: 0,
      'on-leave': 0,
      absent: 0,
    };

    monthDays.forEach(({ isoDate }) => {
      const entry = map[`${employee.id}_${isoDate}`];
      const status = inferStatus(employee.id, isoDate, entry, nowIsoDate);
      // Keep per-day status for cell rendering and summary badges.
      statusesByDate[isoDate] = status;

      const lateMinutes = entry ? computeLateMinutes(entry) : undefined;
      const workMinutes = entry ? computeWorkMinutes(entry) : undefined;
      const expectedStart = entry ? (SHIFT_START_MINUTES[entry.shift] ?? SHIFT_START_MINUTES.Morning) : undefined;
      const actualStart = entry ? toMinutesFromDate(entry.timeIn) : undefined;
      const earlyMinutes =
        entry && expectedStart !== undefined && actualStart !== undefined
          ? Math.max(0, expectedStart - actualStart)
          : undefined;

      dayDetailsByDate[isoDate] = {
        isoDate,
        status,
        timeIn: entry?.timeIn,
        timeOut: entry?.timeOut,
        workMinutes,
        earlyMinutes: status === 'early' ? earlyMinutes : undefined,
        lateMinutes: status === 'late' ? lateMinutes : undefined,
      };

      if (status === 'early') summary.early += 1;
      if (status === 'on-time') summary['on-time'] += 1;
      if (status === 'late') summary.late += 1;
      if (status === 'on-leave') summary['on-leave'] += 1;
      if (status === 'absent') summary.absent += 1;
    });

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      avatarUrl: employee.avatarUrl,
      summary,
      statusesByDate,
      dayDetailsByDate,
    };
  });
};

export const formatMonthYear = (year: number, month: number): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
};
