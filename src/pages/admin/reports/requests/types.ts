export type RequestReportType =
  | 'leave'
  | 'expense'
  | 'fund'
  | 'overtime'
  | 'undertime'
  | 'wfh'
  | 'time-adjustment'
  | 'shift-assignment'
  | 'swap-request';

export type ScopeFilterMode = 'today' | 'last30' | 'month' | 'range';

export interface ScopeFilterState {
  mode: ScopeFilterMode;
  month: string;
  year: string;
  rangeStart: string;
  rangeEnd: string;
}

export interface ReportEmployeeSummary {
  id: string;
  fullName: string;
  position: string;
  avatarUrl: string;
  leaveFiledCount: number;
  expenseTotal: number;
  fundTotal: number;
  fundRemaining: number;
}

export type LeaveType =
  | 'Vacation'
  | 'Earned'
  | 'Maternity'
  | 'Quarantine'
  | 'Sick'
  | 'Emergency'
  | 'Paternity'
  | 'Birthday'
  | 'Casual'
  | 'Others';

export interface ProcessorInfo {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  filedAt: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: string;
  notes: string;
  paid: boolean;
  status: 'Console Assigned' | 'Approved' | 'Declined' | 'Unprocessed' | 'Cancelled';
  reliever: string;
  remarks: string;
  processedBy: ProcessorInfo;
}

export interface ExpenseRecord {
  id: string;
  employeeId: string;
  type: string;
  incurredAt: string;
  notes: string;
  amount: number;
  status: 'Approved' | 'Declined' | 'Unprocessed';
  processedBy: ProcessorInfo;
}

export interface FundPaymentRecord {
  id: string;
  paidAt: string;
  payrollPeriod: string;
  description: string;
  amountDeducted: number;
  status: 'Paid' | 'Voided';
}

export interface FundRecord {
  id: string;
  employeeId: string;
  requestType: 'Cash Advance' | 'Loan';
  requestReason: string;
  requestedAt: string;
  deductionMode: 'Every Pay Day' | 'Every Month';
  deductionStart: string;
  amount: number;
  terms: number;
  deductPerTerm: number;
  paidTerms: number;
  paidAmount: number;
  remainingPayable: number;
  status: 'Approved' | 'Declined' | 'Unprocessed' | 'Cancelled';
  processedBy: ProcessorInfo;
  payments: FundPaymentRecord[];
}

export interface GenericRequestRecord {
  id: string;
  employeeId: string;
  type: string;
  filedAt: string;
  details: string;
  status: 'Approved' | 'Declined' | 'Unprocessed';
  processedBy: ProcessorInfo;
}
