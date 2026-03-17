export type TardinessStatus =
  | 'early'
  | 'on-time'
  | 'late'
  | 'on-leave'
  | 'absent'
  | 'day-off'
  | 'holiday'
  | 'unrendered';

export interface LegendItem {
  key: TardinessStatus;
  label: string;
  shortLabel: string;
  badgeClass: string;
  cellClass: string;
}

export interface MonthDay {
  isoDate: string;
  monthLabel: string;
  dayLabel: string;
  weekdayLabel: string;
}

export interface TardinessEmployeeRow {
  employeeId: string;
  employeeName: string;
  avatarUrl?: string;
  summary: Record<'early' | 'on-time' | 'late' | 'on-leave' | 'absent', number>;
  statusesByDate: Record<string, TardinessStatus>;
  dayDetailsByDate: Record<string, TardinessDayDetail>;
}

export interface TardinessDayDetail {
  isoDate: string;
  status: TardinessStatus;
  timeIn?: string;
  timeOut?: string;
  workMinutes?: number;
  earlyMinutes?: number;
  lateMinutes?: number;
}
