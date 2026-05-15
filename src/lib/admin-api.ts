const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const AUTH_SESSION_KEY = 'auth.session';

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
}

interface StoredSession {
  accessToken: string;
}

export type DashboardRequestTypeLabel =
  | 'Leave'
  | 'Undertime'
  | 'Overtime'
  | 'Work from Home'
  | 'Time Adjustment';

export interface AdminDashboardSummary {
  summary: {
    totalEmployees: number;
    totalTeachingEmployees: number;
    totalNonTeachingEmployees: number;
    teachingActive: number;
    nonTeachingActive: number;
    teachingSessionsPresent: number;
    teachingSessionsTotal: number;
    todayTeachingSessionsAttendance: number;
    onLeave: number;
    pendingRequests: number;
    todayAttendance: number;
    todayTeachingAttendance: number;
    todayNonTeachingAttendance: number;
    totalLate: number;
    activeShifts: number;
  };
  attendanceTrendNonTeaching: Array<{
    day: string;
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  attendanceTrendTeaching: Array<{
    day: string;
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  requestBreakdown: Array<{
    name: DashboardRequestTypeLabel;
    value: number;
  }>;
  priorityRequests: Array<{
    id: string;
    avatarUrl: string | null;
    name: string;
    requestType: DashboardRequestTypeLabel;
    dateSubmitted: string;
  }>;
  tardinessWatchlist: Array<{
    id: string;
    employeeId: string;
    avatarUrl: string | null;
    name: string;
    department: string | null;
    minutesLate: number;
  }>;
  recentMemos: Array<{
    id: string;
    title: string;
    publishedAt: string;
  }>;
}

export interface AdminEmployeeRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ROLE_EMPLOYEE';
  employeeType: 'TEACHING' | 'NON_TEACHING';
  isActive: boolean;
  schoolId: string | null;
  schoolBranch: string | null;
  departmentId: string | null;
  department: string | null;
  position: string | null;
  profileImage: string | null;
  joinDate: string;
  school: { id: string; name: string } | null;
  departmentModel: { id: string; name: string } | null;
}

export interface AdminEmployeeListQuery {
  search?: string;
  schoolId?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'joinDate';
  sortDirection?: 'asc' | 'desc';
}

export interface AdminEmployeeListResponse {
  rows: AdminEmployeeRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdminEmployeePayload {
  email: string;
  firstName: string;
  lastName: string;
  employeeType?: 'TEACHING' | 'NON_TEACHING';
  schoolId: string;
  departmentId?: string | null;
  position?: string | null;
  profileImage?: string | null;
  temporaryPassword?: string;
}

export interface UpdateAdminEmployeePayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  employeeType?: 'TEACHING' | 'NON_TEACHING';
  schoolId?: string;
  departmentId?: string | null;
  position?: string | null;
  profileImage?: string | null;
  isActive?: boolean;
}

export type AdminRequestType =
  | 'LEAVE'
  | 'EXPENSE'
  | 'FUND'
  | 'OVERTIME'
  | 'UNDERTIME'
  | 'WFH'
  | 'TIME_ADJUSTMENT'
  | 'SHIFT_ASSIGNMENT'
  | 'SWAP_REQUEST';

export type AdminRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface AdminRequestRecord {
  id: string;
  type: AdminRequestType;
  status: AdminRequestStatus;
  title: string;
  description: string | null;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  employeeId: string;
  reviewedById: string | null;
  schoolId: string;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
    profileImage: string | null;
  };
  reviewedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  school: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
}

export interface AdminRequestListQuery {
  search?: string;
  type?: AdminRequestType;
  status?: AdminRequestStatus;
  schoolId?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface AdminRequestListResponse {
  rows: AdminRequestRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type TeachingAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type NonTeachingAttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'LEAVE';
export type PerformanceRubricType = 'TEACHING' | 'NON_TEACHING';

export interface AdminTeachingAttendanceRecord {
  id: string;
  employeeId: string;
  status: TeachingAttendanceStatus;
  remarks: string | null;
  minutesLate: number | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
  };
  classSession: {
    id: string;
    sessionDate: string;
    startsAt: string;
    endsAt: string;
    room: string | null;
    subject: {
      id: string;
      code: string;
      name: string;
    };
    school: {
      id: string;
      name: string;
    };
    department: {
      id: string;
      name: string;
    } | null;
  };
}

export interface AdminNonTeachingAttendanceRecord {
  id: string;
  employeeId: string;
  schoolId: string;
  departmentId: string | null;
  attendanceDate: string;
  status: NonTeachingAttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  remarks: string | null;
  minutesLate: number | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
  };
  school: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
}

export interface AdminPerformanceEvaluationRecord {
  id: string;
  employeeId: string;
  schoolId: string;
  departmentId: string | null;
  evaluatorId: string | null;
  rubricType: PerformanceRubricType;
  periodStart: string;
  periodEnd: string;
  criteria: unknown;
  overallScore: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
    employeeType: 'TEACHING' | 'NON_TEACHING';
  };
  evaluator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  school: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
}

export interface AdminAttendanceListQuery {
  schoolId?: string;
  departmentId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminTeachingAttendanceListQuery extends AdminAttendanceListQuery {
  status?: TeachingAttendanceStatus;
}

export interface AdminNonTeachingAttendanceListQuery extends AdminAttendanceListQuery {
  status?: NonTeachingAttendanceStatus;
}

export interface AdminPerformanceEvaluationListQuery extends AdminAttendanceListQuery {
  rubricType?: PerformanceRubricType;
  employeeType?: 'TEACHING' | 'NON_TEACHING';
}

export interface PaginatedResponse<T> {
  rows: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const getAccessToken = (): string => {
  const rawSession = localStorage.getItem(AUTH_SESSION_KEY);
  if (!rawSession) {
    throw new Error('You must sign in before loading admin data');
  }

  const parsed = JSON.parse(rawSession) as StoredSession;
  if (!parsed.accessToken) {
    throw new Error('Your session is missing an access token');
  }

  return parsed.accessToken;
};

const toApiError = async (response: Response): Promise<Error> => {
  let message = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload.error?.message) {
      message = payload.error.message;
    }
  } catch {
    // Fallback to default message.
  }

  return new Error(message);
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return (await response.json()) as T;
};

const buildQuery = (params: Record<string, string | number | boolean | null | undefined>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const getAdminDashboardSummary = (): Promise<AdminDashboardSummary> => {
  return request<AdminDashboardSummary>('/admin/dashboard/summary', {
    method: 'GET',
  });
};

export const getAdminEmployees = (
  query: AdminEmployeeListQuery = {},
): Promise<AdminEmployeeListResponse> => {
  return request<AdminEmployeeListResponse>(
    `/admin/employees/list${buildQuery({
      search: query.search,
      schoolId: query.schoolId,
      departmentId: query.departmentId,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    })}`,
    {
      method: 'GET',
    },
  );
};

export const getAdminEmployeeById = (
  employeeId: string,
): Promise<{ employee: AdminEmployeeRecord }> => {
  return request<{ employee: AdminEmployeeRecord }>(`/admin/employees/${employeeId}`, {
    method: 'GET',
  });
};

export const createAdminEmployee = (
  payload: CreateAdminEmployeePayload,
): Promise<{ employee: AdminEmployeeRecord }> => {
  return request<{ employee: AdminEmployeeRecord }>('/admin/employees/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminEmployee = (
  employeeId: string,
  payload: UpdateAdminEmployeePayload,
): Promise<{ employee: AdminEmployeeRecord }> => {
  return request<{ employee: AdminEmployeeRecord }>(`/admin/employees/${employeeId}/update`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const setAdminEmployeeActive = (
  employeeId: string,
  isActive: boolean,
): Promise<{ employee: AdminEmployeeRecord }> => {
  return updateAdminEmployee(employeeId, { isActive });
};

export const getAdminRequests = (
  query: AdminRequestListQuery = {},
): Promise<AdminRequestListResponse> => {
  return request<AdminRequestListResponse>(
    `/admin/requests/list${buildQuery({
      search: query.search,
      type: query.type,
      status: query.status,
      schoolId: query.schoolId,
      departmentId: query.departmentId,
      page: query.page,
      limit: query.limit,
    })}`,
    {
      method: 'GET',
    },
  );
};

export const getAdminRequestById = (
  requestId: string,
): Promise<{ request: AdminRequestRecord }> => {
  return request<{ request: AdminRequestRecord }>(`/admin/requests/${requestId}`, {
    method: 'GET',
  });
};

export const updateAdminRequestStatus = (
  requestId: string,
  status: AdminRequestStatus,
): Promise<{ request: AdminRequestRecord }> => {
  return request<{ request: AdminRequestRecord }>(`/admin/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const bulkUpdateAdminRequestStatus = (
  ids: string[],
  status: AdminRequestStatus,
): Promise<{ updated: number; requests: AdminRequestRecord[] }> => {
  return request<{ updated: number; requests: AdminRequestRecord[] }>('/admin/requests/bulk-status', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status }),
  });
};

export const getAdminTeachingAttendance = (
  query: AdminTeachingAttendanceListQuery = {},
): Promise<PaginatedResponse<AdminTeachingAttendanceRecord>> => {
  return request<PaginatedResponse<AdminTeachingAttendanceRecord>>(
    `/admin/attendance/teaching/list${buildQuery({
      schoolId: query.schoolId,
      departmentId: query.departmentId,
      employeeId: query.employeeId,
      from: query.from,
      to: query.to,
      status: query.status,
      page: query.page,
      limit: query.limit,
    })}`,
    {
      method: 'GET',
    },
  );
};

export const getAdminNonTeachingAttendance = (
  query: AdminNonTeachingAttendanceListQuery = {},
): Promise<PaginatedResponse<AdminNonTeachingAttendanceRecord>> => {
  return request<PaginatedResponse<AdminNonTeachingAttendanceRecord>>(
    `/admin/attendance/non-teaching/list${buildQuery({
      schoolId: query.schoolId,
      departmentId: query.departmentId,
      employeeId: query.employeeId,
      from: query.from,
      to: query.to,
      status: query.status,
      page: query.page,
      limit: query.limit,
    })}`,
    {
      method: 'GET',
    },
  );
};

export const getAdminPerformanceEvaluations = (
  query: AdminPerformanceEvaluationListQuery = {},
): Promise<PaginatedResponse<AdminPerformanceEvaluationRecord>> => {
  return request<PaginatedResponse<AdminPerformanceEvaluationRecord>>(
    `/admin/performance-evaluations/list${buildQuery({
      schoolId: query.schoolId,
      departmentId: query.departmentId,
      employeeId: query.employeeId,
      from: query.from,
      to: query.to,
      rubricType: query.rubricType,
      employeeType: query.employeeType,
      page: query.page,
      limit: query.limit,
    })}`,
    {
      method: 'GET',
    },
  );
};
