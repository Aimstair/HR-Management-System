import type { EmployeeRequestType } from '../shared/employeePortalTypes';

export interface RequestTypeOption {
  value: EmployeeRequestType;
  label: string;
}

export type RequestFieldInputType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'number'
  | 'select'
  | 'file';

export interface RequestSelectOption {
  label: string;
  value: string;
}

export interface RequestFieldDefinition {
  key: string;
  label: string;
  type: RequestFieldInputType;
  required?: boolean;
  placeholder?: string;
  optional?: boolean;
  options?: RequestSelectOption[];
}

export const EMPLOYEE_REQUEST_TYPE_OPTIONS: RequestTypeOption[] = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'expense', label: 'Expense' },
  { value: 'funds', label: 'Funds' },
  { value: 'undertime', label: 'Undertime' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'change_shift', label: 'Change Shift' },
  { value: 'swap', label: 'Swap' },
  { value: 'remote', label: 'Remote' },
];

export const REQUEST_FORM_SCHEMAS: Record<EmployeeRequestType, RequestFieldDefinition[]> = {
  attendance: [
    { key: 'date', label: 'Attendance Date', type: 'date', required: true },
    { key: 'timeIn', label: 'Time In', type: 'time', required: true },
    { key: 'timeOut', label: 'Time Out', type: 'time', required: true },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'State the correction details for this attendance request',
    },
  ],
  leave: [
    {
      key: 'leaveType',
      label: 'Leave Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Vacation Leave', value: 'Vacation Leave' },
        { label: 'Sick Leave', value: 'Sick Leave' },
        { label: 'Emergency Leave', value: 'Emergency Leave' },
        { label: 'Maternity / Paternity Leave', value: 'Maternity / Paternity Leave' },
      ],
    },
    {
      key: 'leaveCoverage',
      label: 'Whole / Half Day',
      type: 'select',
      required: true,
      options: [
        { label: 'Whole Day', value: 'Whole Day' },
        { label: 'Half Day (AM)', value: 'Half Day (AM)' },
        { label: 'Half Day (PM)', value: 'Half Day (PM)' },
      ],
    },
    { key: 'startDate', label: 'Start Date', type: 'date', required: true },
    { key: 'endDate', label: 'End Date', type: 'date', required: true },
    {
      key: 'reliever',
      label: 'Reliever',
      type: 'text',
      optional: true,
      placeholder: 'Optional reliever name',
    },
    { key: 'attachments', label: 'Attachments', type: 'file', optional: true },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Provide leave request reason',
    },
  ],
  expense: [
    {
      key: 'expenseType',
      label: 'Expense Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Travel', value: 'Travel' },
        { label: 'Teaching Materials', value: 'Teaching Materials' },
        { label: 'Supplies', value: 'Supplies' },
        { label: 'Meals', value: 'Meals' },
      ],
    },
    { key: 'dateIncurred', label: 'Date Incurred', type: 'date', required: true },
    { key: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' },
    { key: 'attachment', label: 'Attachment', type: 'file', required: true },
    {
      key: 'reason',
      label: 'Notes / Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Provide expense details',
    },
  ],
  funds: [
    {
      key: 'requestType',
      label: 'Request Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Cash Advance', value: 'Cash Advance' },
        { label: 'Loan', value: 'Loan' },
      ],
    },
    { key: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' },
    {
      key: 'terms',
      label: 'Terms / Installment Plan',
      type: 'text',
      required: true,
      placeholder: 'Example: 3 payroll deductions',
    },
    { key: 'deductionStartDate', label: 'Deduction Start Date', type: 'date', required: true },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Provide request justification',
    },
  ],
  undertime: [
    { key: 'undertimeDate', label: 'Date of Undertime', type: 'date', required: true },
    { key: 'specifiedTimeOut', label: 'Specified Time Out', type: 'time', required: true },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Explain undertime request',
    },
  ],
  overtime: [
    { key: 'startDateTime', label: 'Start Date and Time', type: 'datetime-local', required: true },
    { key: 'endDateTime', label: 'End Date and Time', type: 'datetime-local', required: true },
    {
      key: 'projectTaskDone',
      label: 'Project / Task Done',
      type: 'text',
      required: true,
      placeholder: 'Task completed during overtime',
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: true,
      placeholder: 'Additional notes',
    },
  ],
  change_shift: [
    {
      key: 'shift',
      label: 'Shift',
      type: 'select',
      required: true,
      options: [
        { label: 'Morning Shift (08:00 - 17:00)', value: 'Morning Shift (08:00 - 17:00)' },
        { label: 'Mid Shift (09:00 - 18:00)', value: 'Mid Shift (09:00 - 18:00)' },
        { label: 'Night Shift (22:00 - 06:00)', value: 'Night Shift (22:00 - 06:00)' },
      ],
    },
    {
      key: 'selectedDates',
      label: 'Selected Dates',
      type: 'text',
      required: true,
      placeholder: 'Example: 2026-03-20, 2026-03-21',
    },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Explain shift reassignment reason',
    },
  ],
  swap: [
    { key: 'swapWith', label: 'Swap With', type: 'text', required: true, placeholder: 'Employee name' },
    {
      key: 'currentShift',
      label: 'Current Shift',
      type: 'text',
      required: true,
      placeholder: 'Current assigned shift',
    },
    {
      key: 'requestedShift',
      label: 'Requested Shift',
      type: 'text',
      required: true,
      placeholder: 'Requested shift schedule',
    },
    {
      key: 'selectedDates',
      label: 'Date(s)',
      type: 'text',
      required: true,
      placeholder: 'Example: 2026-03-20',
    },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Provide reason for swap request',
    },
  ],
  remote: [
    {
      key: 'address',
      label: 'Address',
      type: 'text',
      required: true,
      placeholder: 'Remote work location',
    },
    { key: 'startDateTime', label: 'Start Date and Time', type: 'datetime-local', required: true },
    { key: 'endDateTime', label: 'End Date and Time', type: 'datetime-local', required: true },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea',
      required: true,
      placeholder: 'Provide remote work reason',
    },
  ],
};

export const getRequestTypeLabel = (requestType: EmployeeRequestType): string => {
  return (
    EMPLOYEE_REQUEST_TYPE_OPTIONS.find((option) => option.value === requestType)?.label ||
    requestType.replace('_', ' ')
  );
};
