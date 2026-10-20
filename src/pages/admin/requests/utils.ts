import { RequestStatus } from '../../../types';
import type { AdminRequestRecord, AdminRequestStatus, AdminRequestType } from '../../../lib/admin-api';
import type { RequestCategory, RequestRecord, SortDirection, SortState } from './types';

export const REQUEST_CATEGORY_MENU: Array<{ value: RequestCategory; label: string }> = [
  { value: 'leave', label: 'Leave' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'undertime', label: 'Undertime' },
  { value: 'adjustments', label: 'Adjustments' },
  // { value: 'shift', label: 'Shift' },
  // { value: 'swap', label: 'Swap' },
];

export const statusBadgeClass: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'bg-secondary/20 text-secondary-foreground border-secondary/40',
  [RequestStatus.APPROVED]: 'bg-primary/10 text-primary border-primary/20',
  [RequestStatus.REJECTED]: 'bg-destructive/10 text-destructive border-destructive/20',
  [RequestStatus.CANCELLED]: 'bg-muted text-muted-foreground border-border',
};

export const statusLabel: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'PENDING',
  [RequestStatus.APPROVED]: 'APPROVED',
  [RequestStatus.REJECTED]: 'DECLINED',
  [RequestStatus.CANCELLED]: 'CANCELLED',
};

export const formatDateTime = (iso?: string): string => {
  if (!iso) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};

export const formatMoney = (value?: number): string => {
  if (value === undefined) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(value);
};

export const filterRequestsBySearch = (
  requests: RequestRecord[],
  search: string,
  isServerSearchActive = false,
): RequestRecord[] => {
  if (isServerSearchActive) {
    return requests;
  }

  const term = search.trim().toLowerCase();
  if (!term) {
    return requests;
  }

  return requests.filter((request) => {
    return (
      request.employee.name.toLowerCase().includes(term) ||
      request.employee.position.toLowerCase().includes(term)
    );
  });
};

const sortMultiplier = (direction: SortDirection): number => (direction === 'asc' ? 1 : -1);

export const sortRequests = (
  requests: RequestRecord[],
  sort: SortState,
  getSortValue: (request: RequestRecord, key: string) => string | number,
): RequestRecord[] => {
  return [...requests].sort((a, b) => {
    const valueA = getSortValue(a, sort.key);
    const valueB = getSortValue(b, sort.key);

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA - valueB) * sortMultiplier(sort.direction);
    }

    return String(valueA).localeCompare(String(valueB)) * sortMultiplier(sort.direction);
  });
};

export const categoryLabel = (category: RequestCategory): string => {
  return REQUEST_CATEGORY_MENU.find((item) => item.value === category)?.label || 'Requests';
};

export const mapApiRequestTypeToCategory = (type: AdminRequestType): RequestCategory | null => {
  switch (type) {
    case 'LEAVE':
      return 'leave';
    case 'OVERTIME':
      return 'overtime';
    case 'UNDERTIME':
      return 'undertime';
    case 'TIME_ADJUSTMENT':
      return 'adjustments';
    default:
      return null;
  }
};

export const mapCategoryToApiRequestType = (category: RequestCategory): AdminRequestType | null => {
  switch (category) {
    case 'leave':
      return 'LEAVE';
    case 'overtime':
      return 'OVERTIME';
    case 'undertime':
      return 'UNDERTIME';
    case 'adjustments':
      return 'TIME_ADJUSTMENT';
    default:
      return null;
  }
};

export const mapApiStatusToRequestStatus = (status: AdminRequestStatus): RequestStatus => {
  switch (status) {
    case 'APPROVED':
      return RequestStatus.APPROVED;
    case 'REJECTED':
      return RequestStatus.REJECTED;
    case 'CANCELLED':
      return RequestStatus.CANCELLED;
    default:
      return RequestStatus.PENDING;
  }
};

export const mapRequestStatusToApiStatus = (status: RequestStatus): AdminRequestStatus => {
  switch (status) {
    case RequestStatus.APPROVED:
      return 'APPROVED';
    case RequestStatus.REJECTED:
      return 'REJECTED';
    case RequestStatus.CANCELLED:
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};

export const buildDurationLabel = (startIso?: string | null, endIso?: string | null): string | undefined => {
  if (!startIso || !endIso) {
    return undefined;
  }

  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return undefined;
  }

  const totalMinutes = Math.round((end - start) / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 && parts.length < 2) {
    parts.push(`${minutes}m`);
  }

  return parts.join(' ') || `${totalMinutes}m`;
};

interface AttendanceAppealDescription {
  kind: 'ATTENDANCE_APPEAL';
  date?: string;
  markedStatus?: string;
  subject?: string | null;
  reason?: string;
  previousTimeIn?: string | null;
  previousTimeOut?: string | null;
}

const parseAttendanceAppeal = (description: string | null): AttendanceAppealDescription | null => {
  if (!description || !description.trim().startsWith('{')) {
    return null;
  }

  try {
    const parsed = JSON.parse(description);
    return parsed?.kind === 'ATTENDANCE_APPEAL' ? parsed : null;
  } catch {
    return null;
  }
};

const describeAttendanceAppeal = (appeal: AttendanceAppealDescription): string => {
  const target = [appeal.date, appeal.subject].filter(Boolean).join(' · ');
  const marked = appeal.markedStatus ? `Appeal (${appeal.markedStatus})` : 'Attendance appeal';
  return `${marked}${target ? ` – ${target}` : ''}${appeal.reason ? `: ${appeal.reason}` : ''}`;
};

// Employee-portal requests store their form fields as JSON in the description.
const describeEmployeeFormFields = (description: string | null): string | null => {
  if (!description || !description.trim().startsWith('{')) {
    return null;
  }

  try {
    const fields = JSON.parse(description) as Record<string, unknown>;
    const label = [fields.leaveType, fields.leaveCoverage, fields.projectTaskDone, fields.address]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' · ');
    const detail = [fields.reason, fields.notes].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );
    return [label, detail].filter(Boolean).join(': ') || null;
  } catch {
    return null;
  }
};

export const toRequestRecord = (record: AdminRequestRecord): RequestRecord | null => {
  const category = mapApiRequestTypeToCategory(record.type);
  if (!category) {
    return null;
  }

  const fullName = `${record.employee.firstName} ${record.employee.lastName}`.trim();
  const scheduleFrom = record.leaveStartDate ?? undefined;
  const scheduleTo = record.leaveEndDate ?? undefined;
  const appeal = parseAttendanceAppeal(record.description);

  return {
    ...(appeal
      ? {
          previousFrom: appeal.previousTimeIn ?? undefined,
          previousTo: appeal.previousTimeOut ?? undefined,
        }
      : {}),
    id: record.id,
    category,
    status: mapApiStatusToRequestStatus(record.status),
    employee: {
      name: fullName || 'Unknown Employee',
      position: record.employee.position ?? 'Unassigned',
      avatarUrl: record.employee.profileImage ?? undefined,
    },
    requestDate: record.createdAt,
    notes: appeal
      ? describeAttendanceAppeal(appeal)
      : describeEmployeeFormFields(record.description) ?? record.description ?? record.title,
    remarks: record.remarks ?? undefined,
    duration: buildDurationLabel(scheduleFrom, scheduleTo),
    scheduleFrom,
    scheduleTo,
    startDate: scheduleFrom ?? record.createdAt,
  };
};
