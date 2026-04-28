export type AppRole =
  | 'ROLE_HEAD_HR'
  | 'ROLE_CAMPUS_HR'
  | 'ROLE_EMPLOYEE';

export type AdminScopeType = 'GLOBAL' | 'SCHOOL' | 'DEPARTMENT';

export interface AuthTokenPayload {
  sub: string;
  role: AppRole;
  scopeType: AdminScopeType | null;
  schoolId: string | null;
  departmentId: string | null;
}
