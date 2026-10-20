import type {
  DepartmentMetric,
  DtrEntry,
  DtrFilterState,
  GraphFilterState,
  ReportEmployee,
} from './types';

const SHIFT_START_MINUTES: Record<string, number> = {
  Morning: 8 * 60,
  Mid: 9 * 60,
  Night: 22 * 60,
  Flexible: 10 * 60,
};

export const formatDate = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
};

export const formatDateTime = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const durationMinutes = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
};

const toMinutesFromDate = (iso: string): number => {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
};

export const computeLateMinutes = (entry: DtrEntry): number => {
  const expected = SHIFT_START_MINUTES[entry.shift] ?? SHIFT_START_MINUTES.Morning;
  const actual = toMinutesFromDate(entry.timeIn);
  return Math.max(0, actual - expected);
};

export const computeWorkMinutes = (entry: DtrEntry): number => {
  return durationMinutes(entry.timeIn, entry.timeOut);
};

const toDateValue = (value: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  }

  return new Date(value);
};

const inDateRange = (dateIso: string, start: Date, end: Date): boolean => {
  const value = toDateValue(dateIso);
  if (Number.isNaN(value.getTime())) {
    return false;
  }
  return value >= start && value <= end;
};

const toDateKey = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const filterDtrByRange = (entries: DtrEntry[], filter: DtrFilterState): DtrEntry[] => {
  const now = new Date();

  if (filter.mode === 'last30') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return entries.filter((entry) => inDateRange(entry.timeIn, start, now));
  }

  if (filter.mode === 'month' && filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    const start = new Date(year, (month || 1) - 1, 1, 0, 0, 0);
    const end = new Date(year, month || 1, 0, 23, 59, 59);
    return entries.filter((entry) => inDateRange(entry.timeIn, start, end));
  }

  if (filter.mode === 'range' && filter.rangeStart && filter.rangeEnd) {
    const start = new Date(filter.rangeStart);
    const end = new Date(filter.rangeEnd);
    return entries.filter((entry) => inDateRange(entry.timeIn, start, end));
  }

  return entries;
};

const filterEntriesByGraphRange = (entries: DtrEntry[], filter: GraphFilterState): DtrEntry[] => {
  const now = new Date();

  if (filter.mode === 'last30') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return entries.filter((entry) => inDateRange(entry.date, start, now));
  }

  if (filter.mode === 'thisWeek') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return entries.filter((entry) => inDateRange(entry.date, start, now));
  }

  if (filter.mode === 'month' && filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    const start = new Date(year, (month || 1) - 1, 1, 0, 0, 0);
    const end = new Date(year, month || 1, 0, 23, 59, 59);
    return entries.filter((entry) => inDateRange(entry.date, start, end));
  }

  const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  return entries.filter((entry) => inDateRange(entry.date, start, now));
};

const resolveGraphRange = (filter: GraphFilterState): { start: Date; end: Date } => {
  const now = new Date();

  if (filter.mode === 'last30') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { start, end: now };
  }

  if (filter.mode === 'thisWeek') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }

  if (filter.mode === 'month' && filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    const start = new Date(year, (month || 1) - 1, 1, 0, 0, 0);
    const end = new Date(year, month || 1, 0, 23, 59, 59);
    return { start, end };
  }

  const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  return { start, end: now };
};

const makeDepartmentAggregate = (
  entries: DtrEntry[],
  employeesById: Record<string, ReportEmployee>,
  departments: string[],
  calc: (entry: DtrEntry) => number,
): DepartmentMetric[] => {
  const totals: Record<string, number> = {};

  departments.forEach((department) => {
    totals[department] = 0;
  });

  entries.forEach((entry) => {
    const employee = employeesById[entry.employeeId];
    if (!employee) {
      return;
    }
    totals[employee.department] = (totals[employee.department] || 0) + calc(entry);
  });

  return Object.entries(totals).map(([department, value]) => ({ department, value }));
};

const isLateEntry = (entry: DtrEntry): boolean => {
  if (entry.attendanceStatus) {
    return entry.attendanceStatus === 'LATE';
  }

  return computeLateMinutes(entry) > 0;
};

const isAbsentEntry = (entry: DtrEntry): boolean => {
  return entry.attendanceStatus === 'ABSENT' || entry.attendanceStatus === 'EXCUSED';
};

export interface GraphDataSet {
  manpowerByDepartment: DepartmentMetric[];
  lateByDepartment: DepartmentMetric[];
  absentByDepartment: DepartmentMetric[];
  attendanceTrend: Array<{ date: string; present: number; absent: number }>;
}

export const buildGraphData = (
  employees: ReportEmployee[],
  entries: DtrEntry[],
  graphFilter: GraphFilterState,
): GraphDataSet => {
  const employeesById = employees.reduce<Record<string, ReportEmployee>>((acc, employee) => {
    acc[employee.id] = employee;
    return acc;
  }, {});

  const campusFilteredEmployees =
    graphFilter.campus === 'all'
      ? employees
      : employees.filter((employee) => (employee.campusId ?? employee.campus) === graphFilter.campus);

  const allowedIds = new Set(campusFilteredEmployees.map((employee) => employee.id));
  const filteredEntries = filterEntriesByGraphRange(
    entries.filter((entry) => allowedIds.has(entry.employeeId)),
    graphFilter,
  );

  const manpowerByDepartment = Object.values(
    campusFilteredEmployees.reduce<Record<string, DepartmentMetric>>((acc, employee) => {
      const key = employee.department;
      acc[key] = acc[key] || { department: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {}),
  );

  const departmentNames = manpowerByDepartment.map((item) => item.department);

  const lateByDepartment = makeDepartmentAggregate(
    filteredEntries,
    employeesById,
    departmentNames,
    (entry) => (isLateEntry(entry) ? 1 : 0),
  );

  const absentByDepartment = makeDepartmentAggregate(
    filteredEntries,
    employeesById,
    departmentNames,
    (entry) => (isAbsentEntry(entry) ? 1 : 0),
  );

  const { start: trendStart, end: trendEnd } = resolveGraphRange(graphFilter);
  const trendMap = filteredEntries.reduce<Record<string, { date: string; present: number; absent: number }>>(
    (acc, entry) => {
      const key = entry.date;
      acc[key] = acc[key] || { date: key, present: 0, absent: 0 };
      if (isAbsentEntry(entry)) {
        acc[key].absent += 1;
      } else {
        acc[key].present += 1;
      }
      return acc;
    },
    {},
  );

  const attendanceTrend: Array<{ date: string; present: number; absent: number }> = [];
  const cursor = new Date(trendStart.getFullYear(), trendStart.getMonth(), trendStart.getDate());
  const endDate = new Date(trendEnd.getFullYear(), trendEnd.getMonth(), trendEnd.getDate());

  while (cursor <= endDate) {
    const key = toDateKey(cursor);
    attendanceTrend.push(trendMap[key] ?? { date: key, present: 0, absent: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    manpowerByDepartment,
    lateByDepartment,
    absentByDepartment,
    attendanceTrend,
  };
};

export const toCsv = (headers: string[], rows: Array<Array<string | number>>): string => {
  const escape = (value: string | number): string => {
    const raw = String(value);
    if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [headers.map(escape).join(',')];
  rows.forEach((row) => {
    lines.push(row.map(escape).join(','));
  });

  return lines.join('\n');
};

export const downloadCsv = (filename: string, csv: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
