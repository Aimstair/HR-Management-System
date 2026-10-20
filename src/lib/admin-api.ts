import { refreshRequest, type ApiUser } from './auth-api';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const AUTH_SESSION_KEY = 'auth.session';

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
}

interface StoredSession {
  accessToken: string;
  user?: ApiUser;
}

export type DashboardRequestTypeLabel =
  | 'Leave'
  | 'Undertime'
  | 'Overtime'
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
  idNumber?: string | null;
  sssId?: string | null;
  pagIbigId?: string | null;
  tinNo?: string | null;
  philhealthNo?: string | null;
  school: { id: string; name: string } | null;
  departmentModel: { id: string; name: string } | null;
}

export interface AdminEmployeeListQuery {
  search?: string;
  schoolId?: string;
  departmentId?: string;
  teachingSchoolId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'joinDate';
  sortDirection?: 'asc' | 'desc';
}

export interface AdminOrganizationSchool {
  id: string;
  name: string;
  campusId: string;
  type: 'TEACHING' | 'NON_TEACHING';
  location: string | null;
  contact: string | null;
  email: string | null;
  status: 'Active' | 'Inactive';
  picture: string | null;
  departments?: AdminOrganizationDepartment[];
}

export interface AdminOrganizationDepartment {
  id: string;
  name: string;
  schoolId: string;
  location: string | null;
  contact: string | null;
  email: string | null;
  status: 'Active' | 'Inactive';
  picture: string | null;
}

export interface AdminOrganizationCampus {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  contact: string | null;
  email: string | null;
  status: 'Active' | 'Inactive';
  picture: string | null;
  teachingSchools: AdminOrganizationSchool[];
  nonTeachingDepartments: AdminOrganizationDepartment[];
}

export interface AdminOrganizationResponse {
  campuses: AdminOrganizationCampus[];
}

export interface AdminCampusPayload {
  campusId?: string;
  code?: string;
  name: string;
  address?: string | null;
  contact?: string | null;
  email?: string | null;
  status?: 'Active' | 'Inactive';
  picture?: string | null;
}

export interface AdminSchoolPayload {
  schoolId?: string;
  campusId: string;
  name: string;
  location?: string | null;
  contact?: string | null;
  email?: string | null;
  status?: 'Active' | 'Inactive';
  picture?: string | null;
}

export interface AdminDepartmentPayload {
  departmentId?: string;
  campusId: string;
  name: string;
  location?: string | null;
  contact?: string | null;
  email?: string | null;
  status?: 'Active' | 'Inactive';
  picture?: string | null;
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
  idNumber?: string | null;
  sssId?: string | null;
  pagIbigId?: string | null;
  tinNo?: string | null;
  philhealthNo?: string | null;
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
  idNumber?: string | null;
  sssId?: string | null;
  pagIbigId?: string | null;
  tinNo?: string | null;
  philhealthNo?: string | null;
}

export type AdminRequestType =
  | 'LEAVE'
  | 'EXPENSE'
  | 'FUND'
  | 'OVERTIME'
  | 'UNDERTIME'
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
  remarks: string | null;
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
  requestDateFrom?: string;
  requestDateTo?: string;
  scheduleFrom?: string;
  scheduleTo?: string;
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

export interface CreateAdminRequestPayload {
  type: AdminRequestType;
  employeeId: string;
  title: string;
  description?: string | null;
  remarks?: string | null;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
  status?: AdminRequestStatus;
}

export type AdminMemoRecipientType = 'All' | 'Campus' | 'School' | 'Department' | 'Employees';

export interface AdminMemoRecipient {
  id: string;
  name: string;
  type: AdminMemoRecipientType;
  position?: string;
  avatarUrl?: string;
}

export interface AdminMemoAcknowledge {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string;
  acknowledgedAt: string;
}

export interface AdminMemoRecord {
  id: string;
  memoType: string;
  to: AdminMemoRecipient[];
  agenda: string;
  content: string;
  attachments: string[];
  dateCreated: string;
  effectiveDate: string;
  status: 'Upcoming' | 'Sent';
  requiresAcknowledgement: boolean;
  acknowledgements: AdminMemoAcknowledge[];
}

export interface AdminMemoListResponse {
  memos: AdminMemoRecord[];
}

export interface CreateAdminMemoPayload {
  memoType: string;
  agenda: string;
  content: string;
  attachments?: string[];
  dateCreated?: string;
  effectiveDate?: string;
  recipientType: AdminMemoRecipientType;
  recipientIds?: string[];
}

export interface AdminMemoAttachmentResponse {
  attachments: string[];
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

export interface AdminTeachingClassSessionRecord {
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
    campusId: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
}

export interface CreateAdminTeachingAttendancePayload {
  employeeId: string;
  classSessionId: string;
  status: TeachingAttendanceStatus;
  remarks?: string | null;
  minutesLate?: number | null;
}

export interface UpdateAdminTeachingAttendancePayload {
  employeeId?: string;
  classSessionId?: string;
  status?: TeachingAttendanceStatus;
  remarks?: string | null;
  minutesLate?: number | null;
}

export interface CreateAdminNonTeachingAttendancePayload {
  employeeId: string;
  schoolId?: string;
  departmentId?: string | null;
  attendanceDate: string;
  status: NonTeachingAttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  remarks?: string | null;
  minutesLate?: number | null;
}

export interface UpdateAdminNonTeachingAttendancePayload {
  employeeId?: string;
  schoolId?: string;
  departmentId?: string | null;
  attendanceDate?: string;
  status?: NonTeachingAttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  remarks?: string | null;
  minutesLate?: number | null;
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
    school: {
      name: string;
    };
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

export interface AdminTeachingClassSessionListQuery extends AdminAttendanceListQuery {
  employeeId: string;
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

const saveStoredSession = (session: StoredSession): void => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

const clearStoredSession = (): void => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshed = await refreshRequest();
  saveStoredSession({ accessToken: refreshed.accessToken, user: refreshed.user });
  return refreshed.accessToken;
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

  const makeRequest = async (token: string): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      ...init,
    });

  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      response = await makeRequest(refreshedToken);
    } catch (error) {
      clearStoredSession();
      throw error instanceof Error ? error : await toApiError(response);
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  return (await response.json()) as T;
};

const requestFormData = async <T>(path: string, formData: FormData): Promise<T> => {
  const accessToken = getAccessToken();

  const makeRequest = async (token: string): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
      body: formData,
    });

  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      response = await makeRequest(refreshedToken);
    } catch (error) {
      clearStoredSession();
      throw error instanceof Error ? error : await toApiError(response);
    }
  }

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
      teachingSchoolId: query.teachingSchoolId,
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

export const getAdminOrganizationCampuses = (): Promise<AdminOrganizationResponse> => {
  return request<AdminOrganizationResponse>('/admin/organization/campuses', {
    method: 'GET',
  });
};

export const createAdminCampus = (payload: AdminCampusPayload): Promise<{ campus: AdminOrganizationCampus }> => {
  return request<{ campus: AdminOrganizationCampus }>('/admin/organization/campuses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminCampus = (
  campusId: string,
  payload: Partial<AdminCampusPayload>,
): Promise<{ campus: AdminOrganizationCampus }> => {
  return request<{ campus: AdminOrganizationCampus }>(`/admin/organization/campuses/${campusId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const createAdminSchool = (payload: AdminSchoolPayload): Promise<{ school: AdminOrganizationSchool }> => {
  return request<{ school: AdminOrganizationSchool }>('/admin/organization/schools', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminSchool = (
  schoolId: string,
  payload: Partial<AdminSchoolPayload>,
): Promise<{ school: AdminOrganizationSchool }> => {
  return request<{ school: AdminOrganizationSchool }>(`/admin/organization/schools/${schoolId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const createAdminDepartment = (
  payload: AdminDepartmentPayload,
): Promise<{ department: AdminOrganizationDepartment }> => {
  return request<{ department: AdminOrganizationDepartment }>('/admin/organization/departments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminDepartment = (
  departmentId: string,
  payload: Partial<AdminDepartmentPayload>,
): Promise<{ department: AdminOrganizationDepartment }> => {
  return request<{ department: AdminOrganizationDepartment }>(
    `/admin/organization/departments/${departmentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
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
      requestDateFrom: query.requestDateFrom,
      requestDateTo: query.requestDateTo,
      scheduleFrom: query.scheduleFrom,
      scheduleTo: query.scheduleTo,
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

export const createAdminRequest = (
  payload: CreateAdminRequestPayload,
): Promise<{ request: AdminRequestRecord }> => {
  return request<{ request: AdminRequestRecord }>('/admin/requests/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminRequestStatus = (
  requestId: string,
  status: AdminRequestStatus,
  remarks?: string | null,
): Promise<{ request: AdminRequestRecord }> => {
  return request<{ request: AdminRequestRecord }>(`/admin/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, remarks }),
  });
};

export const bulkUpdateAdminRequestStatus = (
  ids: string[],
  status: AdminRequestStatus,
  remarks?: string | null,
): Promise<{ updated: number; requests: AdminRequestRecord[] }> => {
  return request<{ updated: number; requests: AdminRequestRecord[] }>('/admin/requests/bulk-status', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status, remarks }),
  });
};

export const getAdminMemos = (search?: string): Promise<AdminMemoListResponse> => {
  return request<AdminMemoListResponse>(
    `/admin/memos/list${buildQuery({ search })}`,
    {
      method: 'GET',
    },
  );
};

export const createAdminMemo = (
  payload: CreateAdminMemoPayload,
): Promise<AdminMemoListResponse> => {
  return request<AdminMemoListResponse>('/admin/memos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const uploadAdminMemoAttachments = (
  files: File[],
): Promise<AdminMemoAttachmentResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return requestFormData<AdminMemoAttachmentResponse>('/admin/memos/attachments', formData);
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

export const getAdminTeachingClassSessions = (
  query: AdminTeachingClassSessionListQuery,
): Promise<PaginatedResponse<AdminTeachingClassSessionRecord>> => {
  return request<PaginatedResponse<AdminTeachingClassSessionRecord>>(
    `/admin/attendance/teaching/sessions/list${buildQuery({
      employeeId: query.employeeId,
      schoolId: query.schoolId,
      departmentId: query.departmentId,
      from: query.from,
      to: query.to,
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

export const createAdminTeachingAttendance = (
  payload: CreateAdminTeachingAttendancePayload,
): Promise<{ attendance: AdminTeachingAttendanceRecord }> => {
  return request<{ attendance: AdminTeachingAttendanceRecord }>('/admin/attendance/teaching/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminTeachingAttendance = (
  attendanceId: string,
  payload: UpdateAdminTeachingAttendancePayload,
): Promise<{ attendance: AdminTeachingAttendanceRecord }> => {
  return request<{ attendance: AdminTeachingAttendanceRecord }>(
    `/admin/attendance/teaching/${attendanceId}/update`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
};

export const createAdminNonTeachingAttendance = (
  payload: CreateAdminNonTeachingAttendancePayload,
): Promise<{ attendance: AdminNonTeachingAttendanceRecord }> => {
  return request<{ attendance: AdminNonTeachingAttendanceRecord }>('/admin/attendance/non-teaching/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminNonTeachingAttendance = (
  attendanceId: string,
  payload: UpdateAdminNonTeachingAttendancePayload,
): Promise<{ attendance: AdminNonTeachingAttendanceRecord }> => {
  return request<{ attendance: AdminNonTeachingAttendanceRecord }>(
    `/admin/attendance/non-teaching/${attendanceId}/update`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
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
