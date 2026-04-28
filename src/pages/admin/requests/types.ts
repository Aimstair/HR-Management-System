import { RequestStatus } from '../../../types';

export type RequestCategory =
  | 'leave'
  | 'wfh'
  | 'undertime'
  | 'overtime'
  | 'adjustments'
  | 'shift'
  | 'swap';

export interface EmployeeSummary {
  name: string;
  position: string;
  avatarUrl?: string;
}

export interface RequestRecord {
  id: string;
  category: RequestCategory;
  status: RequestStatus;
  employee: EmployeeSummary;
  requestDate: string;
  notes: string;

  duration?: string;
  scheduleFrom?: string;
  scheduleTo?: string;
  reliever?: string;

  startDate?: string;

  previousFrom?: string;
  previousTo?: string;

  shiftName?: string;
  shiftTime?: string;
  shiftDays?: string;

  unrenderedFrom?: string;
  unrenderedTo?: string;
  renderedFrom?: string;
  renderedTo?: string;
}

export interface ColumnDefinition {
  id: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render: (request: RequestRecord) => React.ReactNode;
  sortValue?: (request: RequestRecord) => string | number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string;
  direction: SortDirection;
}
