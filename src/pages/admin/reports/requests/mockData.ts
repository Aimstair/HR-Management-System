import { campuses } from '../../employees/mockData';
import type {
  ExpenseRecord,
  FundRecord,
  GenericRequestRecord,
  LeaveRecord,
  OvertimeRecord,
  ProcessorInfo,
  ReportEmployeeSummary,
  ShiftAssignmentRecord,
  TimeAdjustmentRecord,
  UndertimeRecord,
  WorkFromHomeRecord,
} from './types';

const employees = Array.from(
  new Map(
    campuses
      .flatMap((campus) =>
        campus.departments.flatMap((department) => [
          ...(department.employees ?? []).map((employee) => ({
            ...employee,
            sourceDepartment: department.name,
          })),
          ...(department.schools?.flatMap((school) =>
            school.employees.map((employee) => ({
              ...employee,
              sourceDepartment: department.name,
            })),
          ) ?? []),
        ]),
      )
      .map((employee) => [employee.id, employee]),
  ).values(),
);

const processors: ProcessorInfo[] = [
  { id: 'PR-1', name: 'Irene Velasco', avatarUrl: 'https://picsum.photos/seed/processor-1/80/80' },
  { id: 'PR-2', name: 'Joel Santos', avatarUrl: 'https://picsum.photos/seed/processor-2/80/80' },
  { id: 'PR-3', name: 'Paul Mercado', avatarUrl: 'https://picsum.photos/seed/processor-3/80/80' },
];

export const reportEmployees: ReportEmployeeSummary[] = employees.slice(0, 18).map((employee, index) => ({
  id: employee.id,
  fullName: employee.fullName,
  position: employee.position,
  department: employee.sourceDepartment || 'General Affairs',
  avatarUrl: employee.profilePicture || employee.avatarUrl || 'https://picsum.photos/seed/default-employee/80/80',
  leaveFiledCount: 2 + (index % 6),
  expenseTotal: 2400 + index * 380,
  fundTotal: 20000 + index * 2500,
  fundRemaining: 12000 + index * 1800,
}));

const employeeIds = reportEmployees.map((employee) => employee.id);

const pickProcessor = (offset: number): ProcessorInfo => processors[offset % processors.length];

export const leaveRecords: LeaveRecord[] = employeeIds.flatMap((employeeId, index) => [
  {
    id: `LEAVE-${employeeId}-1`,
    employeeId,
    filedAt: `2026-03-${String((index % 16) + 1).padStart(2, '0')}T08:20:00`,
    leaveType: 'Vacation',
    startDate: '2026-03-25',
    endDate: '2026-03-27',
    duration: '3 days',
    notes: 'Family travel',
    paid: true,
    status: index % 5 === 0 ? 'Console Assigned' : index % 4 === 0 ? 'Declined' : 'Approved',
    reliever: index % 2 === 0 ? 'Paul Mercado' : 'N/A',
    remarks: index % 4 === 0 ? 'Need revised travel order.' : 'With leave credits.',
    processedBy: pickProcessor(index),
  },
  {
    id: `LEAVE-${employeeId}-2`,
    employeeId,
    filedAt: `2026-02-${String((index % 18) + 1).padStart(2, '0')}T11:15:00`,
    leaveType: 'Sick',
    startDate: '2026-02-14',
    endDate: '2026-02-14',
    duration: 'Half day',
    notes: 'Medical checkup',
    paid: index % 3 !== 0,
    status: index % 3 === 0 ? 'Unprocessed' : 'Approved',
    reliever: 'N/A',
    remarks: index % 3 === 0 ? 'Pending review.' : 'Filed with med cert.',
    processedBy: pickProcessor(index + 1),
  },
]);

export const expenseRecords: ExpenseRecord[] = employeeIds.flatMap((employeeId, index) => [
  {
    id: `EXP-${employeeId}-1`,
    employeeId,
    type: 'Transportation',
    incurredAt: `2026-03-${String((index % 20) + 1).padStart(2, '0')}T09:10:00`,
    notes: 'Campus inter-site transport',
    amount: 550 + index * 30,
    status: index % 4 === 0 ? 'Unprocessed' : 'Approved',
    processedBy: pickProcessor(index),
  },
  {
    id: `EXP-${employeeId}-2`,
    employeeId,
    type: 'Meals',
    incurredAt: `2026-02-${String((index % 20) + 1).padStart(2, '0')}T13:05:00`,
    notes: 'Client meeting meal',
    amount: 340 + index * 20,
    status: index % 5 === 0 ? 'Declined' : 'Approved',
    processedBy: pickProcessor(index + 1),
  },
]);

export const fundRecords: FundRecord[] = employeeIds.slice(0, 12).map((employeeId, index) => {
  const amount = 20000 + index * 2500;
  const paidTerms = 2 + (index % 4);
  const terms = 8 + (index % 5);
  const deductPerTerm = Math.round(amount / terms);
  const paidAmount = paidTerms * deductPerTerm;

  return {
    id: `FUND-${employeeId}-1`,
    employeeId,
    requestType: index % 2 === 0 ? 'Cash Advance' : 'Loan',
    requestReason: index % 2 === 0 ? 'Emergency support' : 'Equipment upgrade',
    requestedAt: `2026-01-${String((index % 20) + 1).padStart(2, '0')}T10:00:00`,
    deductionMode: index % 2 === 0 ? 'Every Pay Day' : 'Every Month',
    deductionStart: '2026-02-15',
    amount,
    terms,
    deductPerTerm,
    paidTerms,
    paidAmount,
    remainingPayable: Math.max(amount - paidAmount, 0),
    status: index % 6 === 0 ? 'Unprocessed' : 'Approved',
    processedBy: pickProcessor(index + 1),
    payments: Array.from({ length: paidTerms }).map((_, paymentIndex) => ({
      id: `PAY-${employeeId}-${paymentIndex + 1}`,
      paidAt: `2026-${String(2 + paymentIndex).padStart(2, '0')}-15T09:15:00`,
      payrollPeriod: `2026-P${paymentIndex + 1}`,
      description: 'Auto payroll deduction',
      amountDeducted: deductPerTerm,
      status: 'Paid',
    })),
  };
});

export const overtimeRecords: OvertimeRecord[] = employeeIds.flatMap((employeeId, index) => {
  const dayA = String((index % 24) + 1).padStart(2, '0');
  const dayB = String(((index + 7) % 24) + 1).padStart(2, '0');

  return [
    {
      id: `OT-${employeeId}-1`,
      employeeId,
      requestedAt: `2026-03-${dayA}T08:35:00`,
      overtimeStart: `2026-03-${dayA}T17:30:00`,
      overtimeEnd: `2026-03-${dayA}T20:00:00`,
      tasksDone: 'Payroll validation and month-end reconciliation',
      notes: 'Urgent completion for payroll cycle cutoff.',
      status: index % 6 === 0 ? 'Unprocessed' : 'Approved',
      processedBy: pickProcessor(index),
    },
    {
      id: `OT-${employeeId}-2`,
      employeeId,
      requestedAt: `2026-02-${dayB}T09:05:00`,
      overtimeStart: `2026-02-${dayB}T18:00:00`,
      overtimeEnd: `2026-02-${dayB}T21:30:00`,
      tasksDone: 'System testing and deployment checklist',
      notes: 'Coordinated with IT for release sign-off.',
      status: index % 5 === 0 ? 'Declined' : 'Approved',
      processedBy: pickProcessor(index + 1),
    },
  ];
});

export const undertimeRecords: UndertimeRecord[] = employeeIds.flatMap((employeeId, index) => {
  const dayA = String((index % 26) + 1).padStart(2, '0');
  const dayB = String(((index + 5) % 26) + 1).padStart(2, '0');

  return [
    {
      id: `UT-${employeeId}-1`,
      employeeId,
      requestedAt: `2026-03-${dayA}T08:10:00`,
      specifiedDateTime: `2026-03-${dayA}T15:30:00`,
      notes: 'Medical consultation in the afternoon.',
      status: index % 4 === 0 ? 'Unprocessed' : 'Approved',
      processedBy: pickProcessor(index + 1),
    },
    {
      id: `UT-${employeeId}-2`,
      employeeId,
      requestedAt: `2026-02-${dayB}T09:25:00`,
      specifiedDateTime: `2026-02-${dayB}T14:00:00`,
      notes: 'Family emergency attendance.',
      status: index % 7 === 0 ? 'Declined' : 'Approved',
      processedBy: pickProcessor(index + 2),
    },
  ];
});

export const wfhRecords: WorkFromHomeRecord[] = employeeIds.flatMap((employeeId, index) => {
  const dayA = String((index % 22) + 1).padStart(2, '0');
  const dayB = String(((index + 10) % 22) + 1).padStart(2, '0');

  return [
    {
      id: `WFH-${employeeId}-1`,
      employeeId,
      requestedAt: `2026-03-${dayA}T08:00:00`,
      startAt: `2026-03-${dayA}T08:30:00`,
      endAt: `2026-03-${dayA}T17:30:00`,
      project: 'Curriculum portal enhancement',
      location: 'Home Office - Quezon City',
      notes: 'Stable connectivity and approved remote setup.',
      status: index % 5 === 0 ? 'Unprocessed' : 'Approved',
      processedBy: pickProcessor(index),
    },
    {
      id: `WFH-${employeeId}-2`,
      employeeId,
      requestedAt: `2026-02-${dayB}T07:45:00`,
      startAt: `2026-02-${dayB}T09:00:00`,
      endAt: `2026-02-${dayB}T18:00:00`,
      project: 'Budget consolidation support',
      location: 'Remote - Laguna',
      notes: 'Submitted progress updates by end of shift.',
      status: index % 6 === 0 ? 'Declined' : 'Approved',
      processedBy: pickProcessor(index + 1),
    },
  ];
});

export const timeAdjustmentRecords: TimeAdjustmentRecord[] = employeeIds.flatMap((employeeId, index) => {
  const dayA = String((index % 24) + 1).padStart(2, '0');
  const dayB = String(((index + 8) % 24) + 1).padStart(2, '0');

  return [
    {
      id: `TA-${employeeId}-1`,
      employeeId,
      requestedAt: `2026-03-${dayA}T10:20:00`,
      specifiedTimeIn: `2026-03-${dayA}T08:00:00`,
      specifiedTimeOut: `2026-03-${dayA}T17:00:00`,
      actualTimeOut: `2026-03-${dayA}T18:15:00`,
      notes: 'Biometric sync delay caused inaccurate timeout.',
      status: index % 4 === 0 ? 'Unprocessed' : 'Approved',
      processedBy: pickProcessor(index + 2),
    },
    {
      id: `TA-${employeeId}-2`,
      employeeId,
      requestedAt: `2026-02-${dayB}T09:40:00`,
      specifiedTimeIn: `2026-02-${dayB}T08:15:00`,
      specifiedTimeOut: `2026-02-${dayB}T17:15:00`,
      actualTimeOut: `2026-02-${dayB}T16:55:00`,
      notes: 'Manual correction due to gate-reader issue.',
      status: index % 7 === 0 ? 'Declined' : 'Approved',
      processedBy: pickProcessor(index),
    },
  ];
});

export const shiftAssignmentRecords: ShiftAssignmentRecord[] = employeeIds.flatMap((employeeId, index) => {
  const dayA = String((index % 18) + 1).padStart(2, '0');
  const dayB = String(((index + 6) % 18) + 1).padStart(2, '0');

  return [
    {
      id: `SA-${employeeId}-1`,
      employeeId,
      requestedAt: `2026-03-${dayA}T09:15:00`,
      shiftName: index % 2 === 0 ? 'Morning Shift' : 'Afternoon Shift',
      shiftTime: index % 2 === 0 ? '06:00 AM - 03:00 PM' : '01:00 PM - 10:00 PM',
      shiftDays: 'Mon, Tue, Wed, Thu, Fri',
      effectiveOn: `2026-03-${dayA}T00:00:00`,
      effectiveTo: `2026-04-${dayA}T23:59:00`,
      notes: 'Realignment for departmental coverage.',
      status: index % 5 === 0 ? 'Unprocessed' : 'Approved',
      remarks: 'Schedule balancing with team availability.',
      processedBy: pickProcessor(index + 1),
    },
    {
      id: `SA-${employeeId}-2`,
      employeeId,
      requestedAt: `2026-02-${dayB}T08:50:00`,
      shiftName: 'Flexible Shift',
      shiftTime: '08:00 AM - 05:00 PM',
      shiftDays: 'Tue, Wed, Thu, Fri, Sat',
      effectiveOn: `2026-02-${dayB}T00:00:00`,
      effectiveTo: `2026-03-${dayB}T23:59:00`,
      notes: 'Requested to support weekend operations.',
      status: index % 6 === 0 ? 'Declined' : 'Approved',
      remarks: 'Pending alternate reliever assignment.',
      processedBy: pickProcessor(index + 2),
    },
  ];
});

const makeGenericRecords = (prefix: string, title: string): GenericRequestRecord[] => {
  return employeeIds.flatMap((employeeId, index) => ({
    id: `${prefix}-${employeeId}-${index + 1}`,
    employeeId,
    type: title,
    filedAt: `2026-03-${String((index % 25) + 1).padStart(2, '0')}T09:00:00`,
    details: `${title} request details for payroll cycle ${index + 1}`,
    status: index % 5 === 0 ? 'Declined' : index % 3 === 0 ? 'Unprocessed' : 'Approved',
    processedBy: pickProcessor(index + 2),
  }));
};

export const swapRequestRecords = makeGenericRecords('SWAP', 'Swap Request');
