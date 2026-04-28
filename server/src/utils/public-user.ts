import type { User } from '@prisma/client';

export const toPublicUser = (user: User) => {
  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeType: user.employeeType,
    department: user.department,
    schoolBranch: user.schoolBranch,
    profileImage: user.profileImage,
    joinDate: user.joinDate.toISOString(),
    position: user.position,
    scope: user.adminScopeType
      ? {
          scopeType: user.adminScopeType,
          schoolId: user.adminSchoolId,
          schoolName: user.adminSchoolName,
          departmentId: user.adminDepartmentId,
          departmentName: user.adminDepartmentName,
        }
      : null,
  };
};
