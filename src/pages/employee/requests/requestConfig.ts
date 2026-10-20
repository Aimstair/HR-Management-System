import type { EmployeeRequestFields, EmployeeRequestType } from '../shared/employeePortalTypes';
import { EmployeeType } from '../../../types';

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

const ALL_REQUEST_TYPE_OPTIONS: RequestTypeOption[] = [
  { value: 'leave', label: 'Leave' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'undertime', label: 'Undertime' },
  { value: 'attendance', label: 'Adjustments' },
];

/** Teaching faculty cannot file overtime or undertime (also enforced by the API). */
const NON_TEACHING_ONLY_TYPES = new Set<EmployeeRequestType>(['overtime', 'undertime']);

export const getAvailableRequestTypeOptions = (employeeType: EmployeeType): RequestTypeOption[] => {
  return employeeType === EmployeeType.TEACHING
    ? ALL_REQUEST_TYPE_OPTIONS.filter((option) => !NON_TEACHING_ONLY_TYPES.has(option.value))
    : ALL_REQUEST_TYPE_OPTIONS;
};

/** Leave types with a fixed length in calendar days, counted from (and including) the start date. */
export const FIXED_DURATION_LEAVE_DAYS: Record<string, number> = {
  'Maternity Leave': 105,
  'Paternity Leave': 7,
};

const addDaysToDateKey = (dateKey: string, days: number): string => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getFixedLeaveDays = (values: EmployeeRequestFields): number | undefined =>
  FIXED_DURATION_LEAVE_DAYS[String(values.leaveType ?? '')];

/**
 * Whether a date field may be set to a Saturday or Sunday. Overtime is the only request
 * that can fall on a rest day (it uses date-time fields); fixed-duration leaves run on
 * calendar days, so their computed end date may land on a weekend.
 */
export const allowsWeekendDates = (
  requestType: EmployeeRequestType,
  fieldKey: string,
  values: EmployeeRequestFields,
): boolean => requestType === 'leave' && fieldKey === 'endDate' && Boolean(getFixedLeaveDays(values));

/** Fields filled in automatically from other values, so the employee cannot edit them. */
export const isDerivedField = (
  requestType: EmployeeRequestType,
  fieldKey: string,
  values: EmployeeRequestFields,
): boolean => {
  if (requestType !== 'leave') {
    return false;
  }

  if (getFixedLeaveDays(values)) {
    return fieldKey === 'endDate' || fieldKey === 'leaveCoverage';
  }

  // Half-day leave covers a single day.
  return fieldKey === 'endDate' && String(values.leaveCoverage ?? '').startsWith('Half Day');
};

/** Earliest selectable value for a date field (end dates cannot precede start dates). */
export const getMinimumDate = (fieldKey: string, values: EmployeeRequestFields): string | undefined =>
  fieldKey === 'endDate' && values.startDate ? String(values.startDate) : undefined;

/** Applies the filing rules after a field changes (fixed durations, half-day ranges). */
export const applyRequestFieldRules = (
  requestType: EmployeeRequestType,
  values: EmployeeRequestFields,
): EmployeeRequestFields => {
  if (requestType !== 'leave') {
    return values;
  }

  const next = { ...values };
  const startDate = String(next.startDate ?? '');
  const fixedDays = getFixedLeaveDays(next);

  if (fixedDays) {
    next.leaveCoverage = 'Whole Day';
    next.endDate = startDate ? addDaysToDateKey(startDate, fixedDays - 1) : '';
    return next;
  }

  if (String(next.leaveCoverage ?? '').startsWith('Half Day')) {
    next.endDate = startDate;
    return next;
  }

  if (startDate && next.endDate && String(next.endDate) < startDate) {
    next.endDate = '';
  }

  return next;
};

/** Explains a fixed-duration leave on the filing form. */
export const describeFixedLeave = (values: EmployeeRequestFields): string | null => {
  const fixedDays = getFixedLeaveDays(values);
  if (!fixedDays) {
    return null;
  }

  return `${values.leaveType} is fixed at ${fixedDays} calendar days from the start date; the end date is set automatically.`;
};

const TEACHING_ATTENDANCE_APPEAL_SCHEMA: RequestFieldDefinition[] = [
  { key: 'sessionDate', label: 'Session Date', type: 'date', required: true },
  {
    key: 'subject',
    label: 'Subject / Session',
    type: 'text',
    required: true,
    placeholder: 'Example: MATH101 - Section A',
  },
  {
    key: 'markedStatus',
    label: 'Marked Status',
    type: 'select',
    required: true,
    options: [
      { label: 'Late', value: 'LATE' },
      { label: 'Absent', value: 'ABSENT' },
    ],
  },
  {
    key: 'reason',
    label: 'Appeal Reason',
    type: 'textarea',
    required: true,
    placeholder: 'Provide supporting details for your attendance appeal',
  },
];

const REQUEST_FORM_SCHEMAS: Record<EmployeeRequestType, RequestFieldDefinition[]> = {
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
        { label: 'Maternity Leave (105 days)', value: 'Maternity Leave' },
        { label: 'Paternity Leave (7 days)', value: 'Paternity Leave' },
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
};

export const getRequestTypeLabel = (requestType: EmployeeRequestType): string => {
  return (
    ALL_REQUEST_TYPE_OPTIONS.find((option) => option.value === requestType)?.label ||
    requestType.replace('_', ' ')
  );
};

export const getRequestFormSchema = (
  requestType: EmployeeRequestType,
  employeeType: EmployeeType,
): RequestFieldDefinition[] => {
  if (requestType === 'attendance' && employeeType === EmployeeType.TEACHING) {
    return TEACHING_ATTENDANCE_APPEAL_SCHEMA;
  }

  return REQUEST_FORM_SCHEMAS[requestType];
};
