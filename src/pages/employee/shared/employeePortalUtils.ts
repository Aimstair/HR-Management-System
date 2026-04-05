import { RequestStatus } from '../../../types';
import type {
  AttendanceStatTotals,
  EmployeeAttendanceEntry,
  EmployeeRequestRecord,
  RequestStatTotals,
} from './employeePortalTypes';

const SHIFT_START_MINUTES: Record<string, number> = {
  Morning: 8 * 60,
  Mid: 9 * 60,
  Night: 22 * 60,
  Flexible: 10 * 60,
};

const SHIFT_REQUIRED_MINUTES = 8 * 60;

const toDate = (value: string): Date => new Date(value);

const toMinutes = (date: Date): number => date.getHours() * 60 + date.getMinutes();

export const toMonthKey = (isoDateOrDateTime: string): string => {
  const date = toDate(isoDateOrDateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const formatDateLabel = (isoDate: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(toDate(isoDate));
};

export const formatTimeLabel = (isoDateTime: string | null): string => {
  if (!isoDateTime) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(toDate(isoDateTime));
};

export const formatDateTimeLabel = (isoDateTime: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(isoDateTime));
};

export const minutesBetween = (startIso: string, endIso: string): number => {
  const start = toDate(startIso).getTime();
  const end = toDate(endIso).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
};

export const computeWorkMinutes = (entry: EmployeeAttendanceEntry): number => {
  if (!entry.timeIn || !entry.timeOut) {
    return 0;
  }

  return minutesBetween(entry.timeIn, entry.timeOut);
};

export const computeLateMinutes = (entry: EmployeeAttendanceEntry): number => {
  if (!entry.timeIn) {
    return 0;
  }

  const expected = SHIFT_START_MINUTES[entry.shift] ?? SHIFT_START_MINUTES.Morning;
  return Math.max(0, toMinutes(toDate(entry.timeIn)) - expected);
};

export const computeUndertimeMinutes = (entry: EmployeeAttendanceEntry): number => {
  const workMinutes = computeWorkMinutes(entry);
  return Math.max(0, SHIFT_REQUIRED_MINUTES - workMinutes);
};

export const getAttendanceStats = (entries: EmployeeAttendanceEntry[]): AttendanceStatTotals => {
  return entries.reduce<AttendanceStatTotals>(
    (acc, entry) => {
      acc.totalWorkMinutes += computeWorkMinutes(entry);
      acc.totalLateMinutes += computeLateMinutes(entry);
      acc.totalUndertimeMinutes += computeUndertimeMinutes(entry);
      return acc;
    },
    {
      totalWorkMinutes: 0,
      totalLateMinutes: 0,
      totalUndertimeMinutes: 0,
    },
  );
};

export const formatDurationHms = (minutes: number): string => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
};

export const filterAttendanceByMonth = (
  entries: EmployeeAttendanceEntry[],
  monthKey: string,
): EmployeeAttendanceEntry[] => {
  return entries
    .filter((entry) => toMonthKey(entry.date) === monthKey)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const filterRequestsByMonthAndType = (
  requests: EmployeeRequestRecord[],
  monthKey: string,
  requestType?: EmployeeRequestRecord['type'],
): EmployeeRequestRecord[] => {
  return requests
    .filter((request) => toMonthKey(request.submittedAt) === monthKey)
    .filter((request) => (requestType ? request.type === requestType : true));
};

export const filterRequestsBySearch = (
  requests: EmployeeRequestRecord[],
  query: string,
): EmployeeRequestRecord[] => {
  const term = query.trim().toLowerCase();
  if (!term) {
    return requests;
  }

  return requests.filter((request) => {
    const fieldText = Object.values(request.fields)
      .flatMap((value) => {
        if (Array.isArray(value)) {
          return value;
        }
        if (value === null) {
          return [];
        }
        return [String(value)];
      })
      .join(' ')
      .toLowerCase();

    return (
      request.summary.toLowerCase().includes(term) ||
      request.type.replace('_', ' ').includes(term) ||
      fieldText.includes(term)
    );
  });
};

export const getRequestStats = (requests: EmployeeRequestRecord[]): RequestStatTotals => {
  return requests.reduce<RequestStatTotals>(
    (acc, request) => {
      acc.total += 1;
      if (request.status === RequestStatus.APPROVED) {
        acc.approved += 1;
      }
      if (request.status === RequestStatus.PENDING) {
        acc.pending += 1;
      }
      if (request.status === RequestStatus.REJECTED) {
        acc.rejected += 1;
      }
      return acc;
    },
    {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    },
  );
};
