import { campuses } from '../employees/mockData';
import type { MemoItem, MemoRecipient } from './types';

export const memoTypeOptions = [
  'Internal Memo',
  'Policy Memo',
  'Disciplinary Memo',
  'Memorandum Circular',
  'Meeting Memo',
] as const;

export const recipientTypeOptions = ['All', 'School', 'Department', 'Employees'] as const;

const employees = campuses.flatMap((campus) =>
  campus.departments.flatMap((department) => [
    ...(department.employees ?? []),
    ...(department.schools?.flatMap((school) => school.employees) ?? []),
  ]),
);

const uniqueEmployees = Array.from(new Map(employees.map((employee) => [employee.id, employee])).values());

const uniqueSchools = Array.from(
  new Set(
    campuses.flatMap((campus) =>
      campus.departments.flatMap((department) => department.schools?.map((school) => school.name) ?? []),
    ),
  ),
).map((name, index) => ({ id: `SCH-${index + 1}`, name, type: 'School' as const }));

const uniqueDepartments = Array.from(
  new Set(campuses.flatMap((campus) => campus.departments.map((department) => department.name))),
).map((name, index) => ({ id: `DEP-${index + 1}`, name, type: 'Department' as const }));

export const recipientPool = {
  School: uniqueSchools,
  Department: uniqueDepartments,
  Employees: uniqueEmployees.map((employee) => ({
    id: employee.id,
    name: employee.fullName,
    type: 'Employees' as const,
    position: employee.position,
    avatarUrl: employee.profilePicture || employee.avatarUrl,
  })),
};

const sampleTo = (items: MemoRecipient[]): MemoRecipient[] => items;

export const initialMemos: MemoItem[] = [
  {
    id: 'MEMO-1001',
    memoType: 'Meeting Memo',
    to: sampleTo([
      { id: 'SCH-1', name: 'School of Engineering', type: 'School' },
      { id: 'SCH-2', name: 'School of Computer Studies', type: 'School' },
    ]),
    agenda: 'Faculty Alignment Meeting',
    content: 'A mandatory faculty alignment meeting will be held to discuss syllabus updates and exam moderation.',
    attachments: ['https://picsum.photos/seed/memo-1001/400/240'],
    dateCreated: '2026-03-18T09:00:00',
    effectiveDate: '2026-03-22T13:00:00',
    status: 'Upcoming',
    acknowledgements: [
      {
        id: 'EMP-1003',
        name: 'Prof. Nina Castro',
        position: 'Professor of Computer Engineering',
        avatarUrl: 'https://picsum.photos/seed/emp-1003/80/80',
        acknowledgedAt: '2026-03-18T10:05:00',
      },
    ],
  },
  {
    id: 'MEMO-1002',
    memoType: 'Policy Memo',
    to: sampleTo([{ id: 'ALL', name: 'All Employees', type: 'All' }]),
    agenda: 'Updated Biometrics Policy',
    content: 'Biometric grace period will be reduced to 5 minutes effective immediately. Please review full policy attachment.',
    attachments: ['https://picsum.photos/seed/memo-1002/400/240', 'https://picsum.photos/seed/memo-1002b/400/240'],
    dateCreated: '2026-03-10T14:20:00',
    effectiveDate: '2026-03-12T08:00:00',
    status: 'Sent',
    acknowledgements: [
      {
        id: 'EMP-2001',
        name: 'Irene Velasco',
        position: 'HR Administrator',
        avatarUrl: 'https://picsum.photos/seed/emp-2001/80/80',
        acknowledgedAt: '2026-03-10T15:00:00',
      },
      {
        id: 'EMP-2003',
        name: 'Joel Santos',
        position: 'Payroll Specialist',
        avatarUrl: 'https://picsum.photos/seed/emp-2003/80/80',
        acknowledgedAt: '2026-03-10T15:22:00',
      },
    ],
  },
  {
    id: 'MEMO-1003',
    memoType: 'Internal Memo',
    to: sampleTo([{ id: 'DEP-2', name: 'Accounting', type: 'Department' }]),
    agenda: 'Quarter-End Submission Reminder',
    content: 'Please submit all quarter-end reconciliation files no later than Friday 5:00 PM.',
    attachments: [],
    dateCreated: '2026-03-15T08:30:00',
    effectiveDate: '2026-03-15T09:00:00',
    status: 'Sent',
    acknowledgements: [],
  },
];
