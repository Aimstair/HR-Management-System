export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type ShiftStatus =
  | 'default'
  | 'console-assigned'
  | 'employee-requested'
  | 'rest-day';

export interface ShiftEmployee {
  id: string;
  fullName: string;
  position: string;
  avatarUrl: string;
  defaultShiftId: string;
}

export interface ShiftGroup {
  id: string;
  name: string;
  daysPerYear: number;
}

export interface ShiftTemplate {
  id: string;
  groupId: string;
  name: string;
  startTime: string;
  endTime: string;
  daysIncluded: Weekday[];
}

export interface ShiftOverride {
  id: string;
  employeeId: string;
  date: string;
  shiftId: string;
  status: Exclude<ShiftStatus, 'default'>;
}

export interface ShiftCell {
  employeeId: string;
  date: string;
  status: ShiftStatus;
  shift: ShiftTemplate | null;
  isToday: boolean;
}

export interface AssignShiftPayload {
  employeeIds: string[];
  shiftGroupId: string;
  shiftId: string;
  type: 'default' | 'date-range';
  startDate?: string;
  endDate?: string;
}
