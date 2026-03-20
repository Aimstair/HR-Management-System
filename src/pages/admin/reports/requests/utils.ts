import type { ScopeFilterState } from './types';

export const formatDateTime = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(value);
};

export const toCsv = (headers: string[], rows: string[][]): string => {
  const escapeCell = (cell: string): string => `"${cell.replace(/"/g, '""')}"`;
  return [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
};

export const downloadCsv = (fileName: string, csv: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const isInScope = (dateIso: string, filter: ScopeFilterState): boolean => {
  const target = new Date(dateIso);
  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const now = new Date();

  if (filter.mode === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return target >= start && target <= end;
  }

  if (filter.mode === 'last30') {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    return target >= start && target <= now;
  }

  if (filter.mode === 'month') {
    const month = Number.parseInt(filter.month, 10);
    const year = Number.parseInt(filter.year, 10);
    if (Number.isNaN(month) || Number.isNaN(year)) {
      return true;
    }
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return target >= start && target <= end;
  }

  if (!filter.rangeStart || !filter.rangeEnd) {
    return true;
  }

  const start = new Date(filter.rangeStart);
  const end = new Date(filter.rangeEnd);
  return target >= start && target <= end;
};

export const paginate = <T,>(items: T[], page: number, pageSize: number): { rows: T[]; totalPages: number; safePage: number } => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    totalPages,
    safePage,
  };
};

export const formatScopeLabel = (scope: ScopeFilterState): string => {
  if (scope.mode === 'today') {
    return 'Today';
  }

  if (scope.mode === 'last30') {
    return 'Last 30 Days';
  }

  if (scope.mode === 'month') {
    const month = Number.parseInt(scope.month, 10);
    const year = Number.parseInt(scope.year, 10);
    if (!Number.isNaN(month) && !Number.isNaN(year)) {
      const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
      return `${monthName} ${year}`;
    }
    return 'Selected Month';
  }

  if (scope.rangeStart && scope.rangeEnd) {
    return `${formatDateTime(scope.rangeStart)} - ${formatDateTime(scope.rangeEnd)}`;
  }

  return 'Custom Range';
};

export const formatReportRangeTitle = (scope: ScopeFilterState, reportName: string): string => {
  return `${formatScopeLabel(scope)} ${reportName}`;
};

export const getDurationHours = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }
  return (end - start) / (1000 * 60 * 60);
};

export const formatHours = (hours: number): string => {
  return `${hours.toFixed(2)} hr`;
};
