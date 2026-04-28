import { RequestStatus } from '../../../types';
import { EmployeeType } from '../../../types';
import { initialMemos } from '../../admin/memo/mockData';
import type {
  EmployeeAttendanceEntry,
  EmployeeRequestDraft,
  EmployeeRequestRecord,
} from './employeePortalTypes';

let requestIdSeed = 2000;

const nextRequestId = (): string => {
  requestIdSeed += 1;
  return `EMP-REQ-${requestIdSeed}`;
};

const asText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
};

const buildSummary = (draft: EmployeeRequestDraft): string => {
  switch (draft.type) {
    case 'attendance': {
      const subject = asText(draft.fields.subject) || asText(draft.fields.classSession);
      const markedStatus = asText(draft.fields.markedStatus);
      if (subject || markedStatus) {
        return `Attendance appeal for ${subject || 'session'} on ${asText(draft.fields.sessionDate)} (${markedStatus || 'status dispute'})`;
      }

      const date = asText(draft.fields.date);
      const timeIn = asText(draft.fields.timeIn);
      const timeOut = asText(draft.fields.timeOut);
      return `Attendance edit for ${date} (${timeIn} - ${timeOut})`;
    }
    case 'leave':
      return `Leave request: ${asText(draft.fields.leaveType)} (${asText(draft.fields.startDate)} to ${asText(draft.fields.endDate)})`;
    case 'undertime':
      return `Undertime request on ${asText(draft.fields.undertimeDate)}`;
    case 'overtime':
      return `Overtime request (${asText(draft.fields.startDateTime)} to ${asText(draft.fields.endDateTime)})`;
    case 'change_shift':
      return `Change shift request: ${asText(draft.fields.shift)} (${asText(draft.fields.selectedDates)})`;
    case 'swap':
      return `Swap request with ${asText(draft.fields.swapWith)} on ${asText(draft.fields.selectedDates)}`;
    case 'remote':
      return `Remote request (${asText(draft.fields.startDateTime)} to ${asText(draft.fields.endDateTime)})`;
    default:
      return 'Request submitted';
  }
};

export const initialAttendanceEntries: EmployeeAttendanceEntry[] = [
  {
    id: 'ATT-1001',
    date: '2026-03-01',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-03-01T08:06:00',
    timeOut: '2026-03-01T17:03:00',
  },
  {
    id: 'ATT-1002',
    date: '2026-03-02',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-03-02T08:17:00',
    timeOut: '2026-03-02T16:42:00',
  },
  {
    id: 'ATT-1003',
    date: '2026-03-03',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-03-03T07:59:00',
    timeOut: '2026-03-03T17:01:00',
  },
  {
    id: 'ATT-1004',
    date: '2026-03-04',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-03-04T08:21:00',
    timeOut: '2026-03-04T16:35:00',
  },
  {
    id: 'ATT-1005',
    date: '2026-03-05',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-03-05T08:08:00',
    timeOut: '2026-03-05T17:11:00',
  },
  {
    id: 'ATT-1006',
    date: '2026-03-06',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-03-06T08:12:00',
    timeOut: '2026-03-06T16:48:00',
  },
  {
    id: 'ATT-1007',
    date: '2026-02-21',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-02-21T08:04:00',
    timeOut: '2026-02-21T17:07:00',
  },
  {
    id: 'ATT-1008',
    date: '2026-02-22',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-02-22T08:19:00',
    timeOut: '2026-02-22T16:49:00',
  },
  {
    id: 'ATT-1009',
    date: '2026-02-23',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-02-23T08:02:00',
    timeOut: '2026-02-23T16:58:00',
  },
  {
    id: 'ATT-1010',
    date: '2026-02-24',
    mode: 'DAILY',
    campus: 'Main Campus',
    shift: 'Morning',
    timeIn: '2026-02-24T08:14:00',
    timeOut: '2026-02-24T16:41:00',
  },
];

export const initialTeachingAttendanceEntries: EmployeeAttendanceEntry[] = [
  {
    id: 'TSESS-3001',
    date: '2026-03-11',
    mode: 'TEACHING_SESSION',
    campus: 'Main Campus',
    shift: null,
    timeIn: null,
    timeOut: null,
    status: 'PRESENT',
    subjectCode: 'MATH101',
    subjectName: 'College Algebra',
    room: 'R-204',
    sessionStart: '2026-03-11T08:00:00',
    sessionEnd: '2026-03-11T09:30:00',
  },
  {
    id: 'TSESS-3002',
    date: '2026-03-11',
    mode: 'TEACHING_SESSION',
    campus: 'Main Campus',
    shift: null,
    timeIn: null,
    timeOut: null,
    status: 'LATE',
    subjectCode: 'MATH201',
    subjectName: 'Statistics',
    room: 'R-101',
    sessionStart: '2026-03-11T13:00:00',
    sessionEnd: '2026-03-11T14:30:00',
  },
  {
    id: 'TSESS-3003',
    date: '2026-03-12',
    mode: 'TEACHING_SESSION',
    campus: 'Main Campus',
    shift: null,
    timeIn: null,
    timeOut: null,
    status: 'ABSENT',
    subjectCode: 'MATH101',
    subjectName: 'College Algebra',
    room: 'R-204',
    sessionStart: '2026-03-12T08:00:00',
    sessionEnd: '2026-03-12T09:30:00',
  },
  {
    id: 'TSESS-3004',
    date: '2026-03-12',
    mode: 'TEACHING_SESSION',
    campus: 'Main Campus',
    shift: null,
    timeIn: null,
    timeOut: null,
    status: 'EXCUSED',
    subjectCode: 'MATH230',
    subjectName: 'Linear Algebra',
    room: 'R-307',
    sessionStart: '2026-03-12T15:00:00',
    sessionEnd: '2026-03-12T16:30:00',
  },
  {
    id: 'TSESS-3005',
    date: '2026-03-13',
    mode: 'TEACHING_SESSION',
    campus: 'Main Campus',
    shift: null,
    timeIn: null,
    timeOut: null,
    status: 'PRESENT',
    subjectCode: 'MATH201',
    subjectName: 'Statistics',
    room: 'R-101',
    sessionStart: '2026-03-13T10:30:00',
    sessionEnd: '2026-03-13T12:00:00',
  },
];

export const initialEmployeeRequests: EmployeeRequestRecord[] = [
  {
    id: 'EMP-REQ-1901',
    type: 'attendance',
    status: RequestStatus.PENDING,
    submittedAt: '2026-03-04T09:20:00',
    summary: 'Attendance edit for 2026-03-02 (08:17 AM - 04:42 PM)',
    fields: {
      date: '2026-03-02',
      timeIn: '08:17',
      timeOut: '16:42',
      reason: 'Biometric did not sync at entry gate.',
      campus: 'Main Campus',
    },
  },
  {
    id: 'EMP-REQ-1902',
    type: 'leave',
    status: RequestStatus.APPROVED,
    submittedAt: '2026-03-01T13:11:00',
    summary: 'Leave request: Vacation Leave (2026-03-15 to 2026-03-16)',
    fields: {
      leaveType: 'Vacation Leave',
      leaveCoverage: 'Whole Day',
      startDate: '2026-03-15',
      endDate: '2026-03-16',
      reliever: 'Michael Chen',
      attachments: ['med-cert.pdf'],
      reason: 'Family commitment.',
    },
  },
  {
    id: 'EMP-REQ-1905',
    type: 'undertime',
    status: RequestStatus.APPROVED,
    submittedAt: '2026-03-03T11:04:00',
    summary: 'Undertime request on 2026-03-03',
    fields: {
      undertimeDate: '2026-03-03',
      specifiedTimeOut: '15:30',
      reason: 'Government appointment.',
    },
  },
  {
    id: 'EMP-REQ-1906',
    type: 'overtime',
    status: RequestStatus.PENDING,
    submittedAt: '2026-03-07T18:50:00',
    summary: 'Overtime request (2026-03-07T18:00 to 2026-03-07T21:00)',
    fields: {
      startDateTime: '2026-03-07T18:00',
      endDateTime: '2026-03-07T21:00',
      projectTaskDone: 'Finalize departmental analytics workbook',
      notes: 'Requested by department chair.',
    },
  },
  {
    id: 'EMP-REQ-1907',
    type: 'change_shift',
    status: RequestStatus.PENDING,
    submittedAt: '2026-03-08T08:14:00',
    summary: 'Change shift request: Mid Shift (2026-03-18, 2026-03-19)',
    fields: {
      shift: 'Mid Shift (09:00 - 18:00)',
      selectedDates: '2026-03-18, 2026-03-19',
      reason: 'Cross-campus coordination meetings.',
    },
  },
  {
    id: 'EMP-REQ-1908',
    type: 'swap',
    status: RequestStatus.APPROVED,
    submittedAt: '2026-03-09T14:12:00',
    summary: 'Swap request with Sara Tan on 2026-03-20',
    fields: {
      swapWith: 'Sara Tan',
      currentShift: 'Morning Shift (08:00 - 17:00)',
      requestedShift: 'Mid Shift (09:00 - 18:00)',
      selectedDates: '2026-03-20',
      reason: 'Mutual schedule adjustment.',
    },
  },
  {
    id: 'EMP-REQ-1909',
    type: 'remote',
    status: RequestStatus.PENDING,
    submittedAt: '2026-03-10T08:58:00',
    summary: 'Remote request (2026-03-11T08:00 to 2026-03-11T17:00)',
    fields: {
      address: 'Blk 4 Lot 9, Riverside, Makati',
      startDateTime: '2026-03-11T08:00',
      endDateTime: '2026-03-11T17:00',
      reason: 'Internet maintenance on campus wing.',
    },
  },
  {
    id: 'EMP-REQ-1910',
    type: 'attendance',
    status: RequestStatus.REJECTED,
    submittedAt: '2026-02-25T09:16:00',
    summary: 'Attendance edit for 2026-02-24 (08:14 AM - 04:41 PM)',
    fields: {
      date: '2026-02-24',
      timeIn: '08:14',
      timeOut: '16:41',
      reason: 'Incorrect biometric punch reading.',
      campus: 'Main Campus',
    },
  },
];

export const initialEmployeeMemos = initialMemos.map((memo, index) => ({
  ...memo,
  id: `EMP-${memo.id}-${index + 1}`,
}));

export const createEmployeeRequestRecord = (
  draft: EmployeeRequestDraft,
): EmployeeRequestRecord => {
  const submittedAt = draft.submittedAt ?? new Date().toISOString();

  return {
    id: nextRequestId(),
    type: draft.type,
    status: draft.status ?? RequestStatus.PENDING,
    submittedAt,
    summary: buildSummary(draft),
    fields: draft.fields,
  };
};

export const getInitialAttendanceEntries = (employeeType: EmployeeType): EmployeeAttendanceEntry[] => {
  if (employeeType === EmployeeType.TEACHING) {
    return [...initialTeachingAttendanceEntries];
  }

  return [...initialAttendanceEntries];
};

export const getInitialEmployeeRequests = (employeeType: EmployeeType): EmployeeRequestRecord[] => {
  if (employeeType === EmployeeType.TEACHING) {
    return initialEmployeeRequests.filter(
      (request) => request.type !== 'change_shift' && request.type !== 'swap',
    );
  }

  return [...initialEmployeeRequests];
};
