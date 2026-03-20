import { campuses } from '../../employees/mockData';
import type {
  ExpenseRecord,
  FundRecord,
  GenericRequestRecord,
  LeaveRecord,
  ProcessorInfo,
  ReportEmployeeSummary,
} from './types';

const employees = Array.from(
  new Map(
    campuses
      .flatMap((campus) =>
        campus.departments.flatMap((department) => [
          ...(department.employees ?? []),
          ...(department.schools?.flatMap((school) => school.employees) ?? []),
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

export const overtimeRecords = makeGenericRecords('OT', 'Overtime');
export const undertimeRecords = makeGenericRecords('UT', 'Undertime');
export const wfhRecords = makeGenericRecords('WFH', 'Work from Home');
export const timeAdjustmentRecords = makeGenericRecords('TA', 'Time Adjustment');
export const shiftAssignmentRecords = makeGenericRecords('SA', 'Shift Assignment');
export const swapRequestRecords = makeGenericRecords('SWAP', 'Swap Request');
