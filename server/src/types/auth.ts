export type AppRole =
  | 'ROLE_HEAD_ADMIN'
  | 'ROLE_SCHOOL_ADMIN'
  | 'ROLE_DEPARTMENT_ADMIN'
  | 'ROLE_EMPLOYEE';

export type AdminScopeType = 'GLOBAL' | 'SCHOOL' | 'DEPARTMENT';

export interface AuthTokenPayload {
  sub: string;
  role: AppRole;
  scopeType: AdminScopeType | null;
  schoolId: string | null;
  departmentId: string | null;
}
