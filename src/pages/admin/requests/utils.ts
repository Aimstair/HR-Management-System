import { RequestStatus } from '../../../types';
import type { RequestCategory, RequestRecord, SortDirection, SortState } from './types';

export const REQUEST_CATEGORY_MENU: Array<{ value: RequestCategory; label: string }> = [
  { value: 'leave', label: 'Leave' },
  { value: 'expense', label: 'Expense' },
  { value: 'wfh', label: 'Work From Home' },
  { value: 'funds', label: 'Funds' },
  { value: 'undertime', label: 'Undertime' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'adjustments', label: 'Adjustments' },
  { value: 'shift', label: 'Shift' },
  { value: 'swap', label: 'Swap' },
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

export const filterRequestsBySearch = (requests: RequestRecord[], search: string): RequestRecord[] => {
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
