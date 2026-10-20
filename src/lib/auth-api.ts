import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
}

interface AuthPayload {
  user: ApiUser;
  accessToken: string;
}

export type ApiUser = Omit<User, 'joinDate'> & {
  joinDate: string;
};

const toApiError = async (response: Response): Promise<Error> => {
  let message = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload.error?.message) {
      message = payload.error.message;
    }
  } catch {
    // Ignore JSON parse issues and fall back to default message.
  }

  return new Error(message);
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const loginRequest = (email: string, password: string): Promise<AuthPayload> => {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const refreshRequest = (): Promise<AuthPayload> => {
  return request<AuthPayload>('/auth/refresh', {
    method: 'POST',
  });
};

export const meRequest = (accessToken: string): Promise<{ user: ApiUser }> => {
  return request<{ user: ApiUser }>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const logoutRequest = (): Promise<void> => {
  return request<void>('/auth/logout', {
    method: 'POST',
  });
};
