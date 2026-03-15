/**
 * Core Type Definitions for HR Management System
 * Strictly typed interfaces for User, Role, Request, and related entities
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export enum UserRole {
  EMPLOYEE = 'ROLE_EMPLOYEE',
  HR = 'ROLE_HR',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  schoolBranch: string;
  profileImage?: string;
  joinDate: Date;
  position: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export enum RequestType {
  LEAVE = 'leave',
  EXPENSE = 'expense',
  WFH = 'wfh',
  FUNDS = 'funds',
  UNDERTIME = 'undertime',
  OVERTIME = 'overtime',
  ATTENDANCE_ADJUSTMENT = 'attendance_adjustment',
  SHIFT_SWAP = 'shift_swap',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface BaseRequest {
  id: string;
  employeeId: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface LeaveRequest extends BaseRequest {
  type: RequestType.LEAVE;
  startDate: Date;
  endDate: Date;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'sabbatical';
  reason: string;
}

export interface ExpenseRequest extends BaseRequest {
  type: RequestType.EXPENSE;
  amount: number;
  category: string;
  description: string;
  receiptUrl?: string;
}

export interface WFHRequest extends BaseRequest {
  type: RequestType.WFH;
  date: Date;
  reason: string;
}

export interface FundsRequest extends BaseRequest {
  type: RequestType.FUNDS;
  amount: number;
  purpose: string;
  justification: string;
}

export interface UndertimeRequest extends BaseRequest {
  type: RequestType.UNDERTIME;
  date: Date;
  hours: number;
  reason: string;
}

export interface OvertimeRequest extends BaseRequest {
  type: RequestType.OVERTIME;
  date: Date;
  hours: number;
  description: string;
}

export interface AttendanceAdjustmentRequest extends BaseRequest {
  type: RequestType.ATTENDANCE_ADJUSTMENT;
  date: Date;
  adjustmentType: 'present' | 'absent' | 'late' | 'early-leave';
  reason: string;
}

export interface ShiftSwapRequest extends BaseRequest {
  type: RequestType.SHIFT_SWAP;
  originalShiftId: string;
  requestedShiftId: string;
  swapWithEmployeeId: string;
}

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export interface SchoolBranch {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  branchId: string;
  headId?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  leaderId?: string;
  createdAt: Date;
}

// ============================================================================
// ATTENDANCE & SHIFT TYPES
// ============================================================================

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_LEAVE = 'early_leave',
  ON_LEAVE = 'on_leave',
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursWorked?: number;
  notes?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  department: string;
  createdAt: Date;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// ============================================================================
// EVALUATION TYPES
// ============================================================================

export interface EvaluationScore {
  category: string;
  score: number; // 1-5
  feedback: string;
}

export interface StudentEvaluation {
  id: string;
  employeeId: string;
  studentName: string;
  courseCode: string;
  scores: EvaluationScore[];
  overallRating: number;
  comments: string;
  createdAt: Date;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface DashboardMetrics {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingRequests: number;
  averageAttendance: number;
}

export interface EmployeeDashboardData {
  totalLeaveBalance: number;
  usedLeave: number;
  pendingRequests: number;
  upcomingShifts: number;
  recentEvaluations: StudentEvaluation[];
}

export interface AnalyticsData {
  month: string;
  attendance: number;
  leave: number;
  requests: number;
}
