import type { AppRole, AuthTokenPayload } from '../types/auth.js';
import { ApiError } from '../middleware/error.js';
import { RETIRED_REQUEST_TYPES } from './request-rules.js';

const ensureSchoolScope = (auth: AuthTokenPayload): string => {
  if (!auth.schoolId) {
    throw new ApiError(403, 'Campus HR account is missing school scope configuration');
  }

  return auth.schoolId;
};

export const getScopedSchoolId = (auth: AuthTokenPayload): string | null => {
  if (auth.role === 'ROLE_HEAD_HR') {
    return null;
  }

  if (auth.role === 'ROLE_CAMPUS_HR') {
    return ensureSchoolScope(auth);
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};

export const getScopedDepartmentId = (auth: AuthTokenPayload): string | null => {
  // HR hierarchy is school-scoped or global only.
  void auth;

  return null;
};

export const getScopedUserWhere = (auth: AuthTokenPayload, role: AppRole) => {
  const base = { role };

  if (auth.role === 'ROLE_HEAD_HR') {
    return base;
  }

  if (auth.role === 'ROLE_CAMPUS_HR') {
    return {
      ...base,
      schoolId: ensureSchoolScope(auth),
    };
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};

export const getScopedRequestWhere = (auth: AuthTokenPayload) => {
  // Retired request types (work from home) stay hidden from every HR view.
  const activeTypes = { type: { notIn: RETIRED_REQUEST_TYPES } };

  if (auth.role === 'ROLE_HEAD_HR') {
    return activeTypes;
  }

  if (auth.role === 'ROLE_CAMPUS_HR') {
    return {
      ...activeTypes,
      campusId: ensureSchoolScope(auth),
    };
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};

export const getScopedShiftWhere = (auth: AuthTokenPayload) => {
  if (auth.role === 'ROLE_HEAD_HR') {
    return {};
  }

  if (auth.role === 'ROLE_CAMPUS_HR') {
    return {
      campusId: ensureSchoolScope(auth),
    };
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};
