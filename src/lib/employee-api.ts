import { refreshRequest } from './auth-api';
import type { RequestType, RequestStatus } from '../../server/node_modules/@prisma/client';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const AUTH_SESSION_KEY = 'auth.session';

const getAuthHeaders = (): Record<string, string> => {
  const sessionData = localStorage.getItem(AUTH_SESSION_KEY);
  if (!sessionData) {
    return {};
  }
  try {
    const session = JSON.parse(sessionData);
    if (session.accessToken) {
      return { Authorization: `Bearer ${session.accessToken}` };
    }
  } catch (error) {
    //
  }
  return {};
};

const handleResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    const result = await refreshRequest();
    if (result.success && result.session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(result.session));
      // Re-trigger location reload? No, let the caller handle it or re-fetch.
      window.location.reload();
      throw new Error('Session refreshed, reloading');
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export interface EmployeeDashboardSummary {
  summary: {
    totalAttendanceEntries: number;
    pendingRequests: number;
  };
  recentMemos: Array<{
    memoId: string;
    title: string;
    publishedAt: string;
    effectiveDate: string;
  }>;
}

export const fetchEmployeeDashboard = async (): Promise<EmployeeDashboardSummary> => {
  const response = await fetch(`${API_BASE_URL}/employee/dashboard`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const fetchEmployeeRequests = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/requests`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const submitEmployeeRequest = async (payload: {
  type: RequestType | string;
  title: string;
  description?: string;
  remarks?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/requests`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const fetchEmployeeAttendance = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/attendance`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const fetchEmployeeMemos = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/memos`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const fetchEmployeeEvaluations = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/evaluations`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const acknowledgeMemo = async (memoId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/memos/${memoId}/acknowledge`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const submitAttendanceAppeal = async (
  attendanceId: string,
  payload: {
    mode: 'DAILY' | 'TEACHING_SESSION';
    reason: string;
    requestedTimeIn?: string | null;
    requestedTimeOut?: string | null;
  },
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/employee/attendance/${attendanceId}/appeal`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};
