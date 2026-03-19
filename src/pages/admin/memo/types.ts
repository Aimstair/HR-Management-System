export type MemoStatus = 'Upcoming' | 'Sent';

export type MemoType =
  | 'Internal Memo'
  | 'Policy Memo'
  | 'Disciplinary Memo'
  | 'Memorandum Circular'
  | 'Meeting Memo';

export type RecipientType = 'All' | 'School' | 'Department' | 'Employees';

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'range';

export interface MemoRecipient {
  id: string;
  name: string;
  type: RecipientType | 'Employee';
  position?: string;
  avatarUrl?: string;
}

export interface MemoAcknowledge {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string;
  acknowledgedAt: string;
}

export interface MemoItem {
  id: string;
  memoType: MemoType;
  to: MemoRecipient[];
  agenda: string;
  content: string;
  attachments: string[];
  dateCreated: string;
  effectiveDate: string;
  status: MemoStatus;
  acknowledgements: MemoAcknowledge[];
}

export interface MemoFilterState {
  search: string;
  status: 'all' | MemoStatus;
  timeFilter: TimeFilter;
  selectedMonth: string;
  selectedYear: string;
  rangeStart: string;
  rangeEnd: string;
}
