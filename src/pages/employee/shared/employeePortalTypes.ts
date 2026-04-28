import { RequestStatus } from '../../../types';
import type { MemoItem } from '../../admin/memo/types';

export type EmployeeRequestType =
  | 'attendance'
  | 'leave'
  | 'undertime'
  | 'overtime'
  | 'change_shift'
  | 'swap'
  | 'remote';

export type TeachingAttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export type AttendanceEntryMode = 'DAILY' | 'TEACHING_SESSION';

export type EmployeeShiftType = 'Morning' | 'Mid' | 'Night' | 'Flexible';

export interface EmployeeAttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mode: AttendanceEntryMode;
  campus: string | null;
  shift: EmployeeShiftType | null;
  timeIn: string | null; // ISO datetime-like string
  timeOut: string | null; // ISO datetime-like string
  status?: TeachingAttendanceStatus;
  subjectCode?: string | null;
  subjectName?: string | null;
  room?: string | null;
  sessionStart?: string | null;
  sessionEnd?: string | null;
}

export type EmployeeRequestFieldValue = string | number | string[] | null;
export type EmployeeRequestFields = Record<string, EmployeeRequestFieldValue>;

export interface EmployeeRequestRecord {
  id: string;
  type: EmployeeRequestType;
  status: RequestStatus;
  submittedAt: string;
  summary: string;
  fields: EmployeeRequestFields;
}

export interface EmployeeRequestDraft {
  type: EmployeeRequestType;
  fields: EmployeeRequestFields;
  submittedAt?: string;
  status?: RequestStatus;
}

export interface AttendanceStatTotals {
  totalWorkMinutes: number;
  totalLateMinutes: number;
  totalUndertimeMinutes: number;
}

export interface TeachingAttendanceSessionTotals {
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  appealable: number;
}

export interface RequestStatTotals {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface EmployeePortalContextValue {
  attendanceEntries: EmployeeAttendanceEntry[];
  requests: EmployeeRequestRecord[];
  memos: MemoItem[];
  submitRequest: (draft: EmployeeRequestDraft) => EmployeeRequestRecord;
  submitAttendanceEditRequest: (payload: {
    attendanceEntryId: string;
    timeIn: string;
    timeOut: string;
    reason: string;
  }) => EmployeeRequestRecord | null;
}
