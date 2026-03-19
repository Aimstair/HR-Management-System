import type {
  DayMetric,
  DepartmentMetric,
  DtrEntry,
  DtrFilterState,
  EmployeeMetric,
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

const inDateRange = (dateIso: string, start: Date, end: Date): boolean => {
  const value = new Date(dateIso);
  return value >= start && value <= end;
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
    return entries.filter((entry) => inDateRange(entry.timeIn, start, now));
  }

  if (filter.mode === 'thisWeek') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return entries.filter((entry) => inDateRange(entry.timeIn, start, now));
  }

  if (filter.mode === 'month' && filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    const start = new Date(year, (month || 1) - 1, 1, 0, 0, 0);
    const end = new Date(year, month || 1, 0, 23, 59, 59);
    return entries.filter((entry) => inDateRange(entry.timeIn, start, end));
  }

  const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  return entries.filter((entry) => inDateRange(entry.timeIn, start, now));
};

const makeDepartmentAggregate = (
  entries: DtrEntry[],
  employeesById: Record<string, ReportEmployee>,
  calc: (entry: DtrEntry) => number,
): DepartmentMetric[] => {
  const totals: Record<string, number> = {};

  entries.forEach((entry) => {
    const employee = employeesById[entry.employeeId];
    if (!employee) {
      return;
    }
    totals[employee.department] = (totals[employee.department] || 0) + calc(entry);
  });

  return Object.entries(totals).map(([department, value]) => ({ department, value }));
};

export interface GraphDataSet {
  manpowerByDepartment: DepartmentMetric[];
  lateByDepartment: DepartmentMetric[];
  absentByDepartment: DepartmentMetric[];
  totalLateHoursByEmployee: EmployeeMetric[];
  lateCountByDepartmentByDay: DayMetric[];
  lateCountOfTeamByDay: DayMetric[];
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
      : employees.filter((employee) => employee.campus === graphFilter.campus);

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

  const lateByDepartment = makeDepartmentAggregate(filteredEntries, employeesById, (entry) =>
    computeLateMinutes(entry) > 0 ? 1 : 0,
  );

  const absentByDepartment = manpowerByDepartment.map((item) => ({
    department: item.department,
    value: Math.max(0, item.value - (lateByDepartment.find((x) => x.department === item.department)?.value || 0)),
  }));

  const totalLateHoursByEmployee = Object.values(
    filteredEntries.reduce<Record<string, EmployeeMetric>>((acc, entry) => {
      const employee = employeesById[entry.employeeId];
      if (!employee) {
        return acc;
      }
      const key = employee.fullName;
      acc[key] = acc[key] || { employeeName: key, value: 0 };
      acc[key].value += Math.round((computeLateMinutes(entry) / 60) * 100) / 100;
      return acc;
    }, {}),
  );

  const lateCountByDepartmentByDay = Object.values(
    filteredEntries.reduce<Record<string, DayMetric>>((acc, entry) => {
      const day = entry.date;
      acc[day] = acc[day] || { day, value: 0 };
      if (computeLateMinutes(entry) > 0) {
        acc[day].value += 1;
      }
      return acc;
    }, {}),
  );

  const lateCountOfTeamByDay = lateCountByDepartmentByDay.map((dayItem) => ({
    day: dayItem.day,
    value: dayItem.value,
  }));

  return {
    manpowerByDepartment,
    lateByDepartment,
    absentByDepartment,
    totalLateHoursByEmployee,
    lateCountByDepartmentByDay,
    lateCountOfTeamByDay,
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
