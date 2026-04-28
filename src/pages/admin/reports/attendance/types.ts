export type ShiftType = 'Morning' | 'Mid' | 'Night' | 'Flexible';

export interface ReportEmployee {
  id: string;
  fullName: string;
  department: string;
  position: string;
  campus: string;
  employeeType: 'TEACHING' | 'NON_TEACHING';
  avatarUrl?: string;
}

export interface DtrEntry {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  timeIn: string; // ISO date time
  timeOut: string; // ISO date time
  subjectCode?: string;
  subjectName?: string;
  semester?: string;
  remarks?: string;
  attendanceStatus?: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
}

export interface AddTimeFormValues {
  employeeId: string;
  start: string;
  end: string;
  subject?: string;
  status?: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  notes: string;
}

export type DtrFilterMode = 'last30' | 'month' | 'range';

export interface DtrFilterState {
  mode: DtrFilterMode;
  month: string;
  rangeStart: string;
  rangeEnd: string;
}

export type GraphFilterMode = 'last30' | 'thisWeek' | 'month' | 'ytd';

export interface GraphFilterState {
  mode: GraphFilterMode;
  month: string;
  campus: 'all' | string;
}

export type ExportRangeMode = 'month' | 'range';

export interface DepartmentMetric {
  department: string;
  value: number;
}

export interface DayMetric {
  day: string;
  value: number;
}

export interface EmployeeMetric {
  employeeName: string;
  value: number;
}
