import type { LegendItem } from './types';

export const LEGEND_ITEMS: LegendItem[] = [
  {
    key: 'early',
    label: 'Early',
    shortLabel: 'E',
    badgeClass: 'border-blue-200 bg-blue-100 text-blue-800',
    cellClass: 'bg-blue-100/80 text-blue-900',
  },
  {
    key: 'on-time',
    label: 'On Time',
    shortLabel: 'OT',
    badgeClass: 'border-emerald-200 bg-emerald-100 text-emerald-800',
    cellClass: 'bg-emerald-100/80 text-emerald-900',
  },
  {
    key: 'late',
    label: 'Late',
    shortLabel: 'L',
    badgeClass: 'border-amber-200 bg-amber-100 text-amber-800',
    cellClass: 'bg-amber-100/80 text-amber-900',
  },
  {
    key: 'on-leave',
    label: 'On Leave',
    shortLabel: 'LV',
    badgeClass: 'border-pink-200 bg-pink-100 text-pink-800',
    cellClass: 'bg-pink-100/80 text-pink-900',
  },
  {
    key: 'absent',
    label: 'Absent',
    shortLabel: 'A',
    badgeClass: 'border-red-200 bg-red-100 text-red-800',
    cellClass: 'bg-red-100/80 text-red-900',
  },
  {
    key: 'day-off',
    label: 'Day Off',
    shortLabel: 'DO',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
    cellClass: 'bg-slate-100/80 text-slate-700',
  },
  {
    key: 'holiday',
    label: 'Holiday',
    shortLabel: 'H',
    badgeClass: 'border-violet-200 bg-violet-100 text-violet-800',
    cellClass: 'bg-violet-100/80 text-violet-900',
  },
  {
    key: 'unrendered',
    label: 'Unrendered',
    shortLabel: '-',
    badgeClass: 'border-border bg-background text-muted-foreground',
    cellClass: 'bg-transparent text-muted-foreground',
  },
];

export const HOLIDAY_DATES: string[] = ['2026-01-01', '2026-02-25', '2026-12-25'];

export const LEAVE_DATES_BY_EMPLOYEE: Record<string, string[]> = {
  'EMP-002': ['2026-01-07', '2026-01-08'],
  'EMP-003': ['2026-01-13'],
  'EMP-004': ['2026-01-20'],
  'EMP-006': ['2026-01-27'],
};
