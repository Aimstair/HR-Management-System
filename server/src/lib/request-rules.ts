import type { EmployeeType, RequestType } from '@prisma/client';
import { ApiError } from '../middleware/error.js';

/** Work-from-home requests were retired; legacy rows are hidden everywhere. */
export const RETIRED_REQUEST_TYPES: RequestType[] = ['WFH'];

/** Teaching faculty cannot file these request types. */
export const NON_TEACHING_ONLY_REQUEST_TYPES: RequestType[] = ['OVERTIME', 'UNDERTIME'];

/** Leave types with a fixed length in calendar days, counted from (and including) the start date. */
export const FIXED_DURATION_LEAVE_DAYS: Record<string, number> = {
  'Maternity Leave': 105,
  'Paternity Leave': 7,
};

const DAY_MS = 86_400_000;

const parseFormFields = (description: string | null | undefined): Record<string, unknown> => {
  if (!description || !description.trim().startsWith('{')) {
    return {};
  }

  try {
    return JSON.parse(description);
  } catch {
    return {};
  }
};

/** Date-only form values ("YYYY-MM-DD") are weekend-checked on their calendar date. */
const isWeekendDateKey = (value: unknown): boolean => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const day = new Date(`${value}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

/**
 * Validates an employee-filed request against the filing rules and returns the
 * schedule dates to store (fixed-duration leaves get their end date computed here).
 */
export const applyEmployeeRequestRules = (input: {
  type: RequestType;
  employeeType: EmployeeType;
  description: string | null | undefined;
  leaveStartDate: Date | null;
  leaveEndDate: Date | null;
}): { leaveStartDate: Date | null; leaveEndDate: Date | null } => {
  if (RETIRED_REQUEST_TYPES.includes(input.type)) {
    throw new ApiError(400, 'This request type is no longer available');
  }

  if (input.employeeType === 'TEACHING' && NON_TEACHING_ONLY_REQUEST_TYPES.includes(input.type)) {
    throw new ApiError(403, 'Teaching faculty cannot file overtime or undertime requests');
  }

  const fields = parseFormFields(input.description);
  const weekdayOnlyKeys =
    input.type === 'LEAVE'
      ? ['startDate']
      : input.type === 'UNDERTIME'
        ? ['undertimeDate']
        : input.type === 'TIME_ADJUSTMENT'
          ? ['date', 'sessionDate']
          : [];

  const fixedDays = typeof fields.leaveType === 'string' ? FIXED_DURATION_LEAVE_DAYS[fields.leaveType] : undefined;
  // Fixed-duration leaves run on calendar days, so only their start must be a weekday.
  if (input.type === 'LEAVE' && !fixedDays) {
    weekdayOnlyKeys.push('endDate');
  }

  const weekendKey = weekdayOnlyKeys.find((key) => isWeekendDateKey(fields[key]));
  if (weekendKey) {
    throw new ApiError(400, 'Requests cannot be filed for a Saturday or Sunday');
  }

  if (input.type === 'LEAVE' && fixedDays && input.leaveStartDate) {
    return {
      leaveStartDate: input.leaveStartDate,
      leaveEndDate: new Date(input.leaveStartDate.getTime() + (fixedDays - 1) * DAY_MS),
    };
  }

  if (input.leaveStartDate && input.leaveEndDate && input.leaveEndDate < input.leaveStartDate) {
    throw new ApiError(400, 'End date must be on or after the start date');
  }

  return { leaveStartDate: input.leaveStartDate, leaveEndDate: input.leaveEndDate };
};
