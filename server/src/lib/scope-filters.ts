import type { AppRole, AuthTokenPayload } from '../types/auth.js';
import { ApiError } from '../middleware/error.js';

const ensureSchoolScope = (auth: AuthTokenPayload): string => {
  if (!auth.schoolId) {
    throw new ApiError(403, 'School admin account is missing school scope configuration');
  }

  return auth.schoolId;
};

const ensureDepartmentScope = (auth: AuthTokenPayload): string => {
  if (!auth.departmentId) {
    throw new ApiError(403, 'Department admin account is missing department scope configuration');
  }

  return auth.departmentId;
};

export const getScopedSchoolId = (auth: AuthTokenPayload): string | null => {
  if (auth.role === 'ROLE_HEAD_ADMIN') {
    return null;
  }

  if (auth.role === 'ROLE_SCHOOL_ADMIN') {
    return ensureSchoolScope(auth);
  }

  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    return auth.schoolId ?? null;
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};

export const getScopedDepartmentId = (auth: AuthTokenPayload): string | null => {
  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    return ensureDepartmentScope(auth);
  }

  return null;
};

export const getScopedUserWhere = (auth: AuthTokenPayload, role: AppRole) => {
  const base = { role };

  if (auth.role === 'ROLE_HEAD_ADMIN') {
    return base;
  }

  if (auth.role === 'ROLE_SCHOOL_ADMIN') {
    return {
      ...base,
      schoolId: ensureSchoolScope(auth),
    };
  }

  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    return {
      ...base,
      departmentId: ensureDepartmentScope(auth),
    };
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};

export const getScopedRequestWhere = (auth: AuthTokenPayload) => {
  if (auth.role === 'ROLE_HEAD_ADMIN') {
    return {};
  }

  if (auth.role === 'ROLE_SCHOOL_ADMIN') {
    return {
      schoolId: ensureSchoolScope(auth),
    };
  }

  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    return {
      departmentId: ensureDepartmentScope(auth),
    };
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};

export const getScopedShiftWhere = (auth: AuthTokenPayload) => {
  if (auth.role === 'ROLE_HEAD_ADMIN') {
    return {};
  }

  if (auth.role === 'ROLE_SCHOOL_ADMIN') {
    return {
      schoolId: ensureSchoolScope(auth),
    };
  }

  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    return {
      departmentId: ensureDepartmentScope(auth),
    };
  }

  throw new ApiError(403, 'This endpoint requires an admin role');
};
