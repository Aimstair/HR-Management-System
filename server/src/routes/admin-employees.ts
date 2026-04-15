import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { getScopedUserWhere } from '../lib/scope-filters.js';
import { hashPassword } from '../lib/password.js';
import type { AppRole } from '../types/auth.js';

export const adminEmployeesRouter = Router();

const ADMIN_ROLES: AppRole[] = [
  'ROLE_HEAD_ADMIN',
  'ROLE_SCHOOL_ADMIN',
  'ROLE_DEPARTMENT_ADMIN',
];

const listEmployeesQuerySchema = z.object({
  search: z.string().trim().optional(),
  schoolId: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'joinDate']).default('lastName'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
});

const employeeIdParamsSchema = z.object({
  employeeId: z.string().trim().min(1),
});

const createEmployeeBodySchema = z.object({
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  schoolId: z.string().trim().min(1),
  departmentId: z.string().trim().min(1).nullable().optional(),
  position: z.string().trim().nullable().optional(),
  profileImage: z.string().trim().nullable().optional(),
  temporaryPassword: z.string().min(8).max(128).optional(),
});

const updateEmployeeBodySchema = z
  .object({
    email: z.string().trim().email().optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    schoolId: z.string().trim().min(1).optional(),
    departmentId: z.string().trim().min(1).nullable().optional(),
    position: z.string().trim().nullable().optional(),
    profileImage: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided for update',
  });

const deactivateEmployeeBodySchema = z.object({
  isActive: z.boolean().default(false),
});

const employeeSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  schoolId: true,
  schoolBranch: true,
  departmentId: true,
  department: true,
  position: true,
  profileImage: true,
  joinDate: true,
  school: {
    select: {
      id: true,
      name: true,
    },
  },
  departmentModel: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

type AdminAuth = {
  sub: string;
  role: AppRole;
  schoolId: string | null;
  departmentId: string | null;
};

const assertScopeFilters = (
  auth: AdminAuth,
  schoolId?: string,
  departmentId?: string,
): void => {
  if (auth.role === 'ROLE_SCHOOL_ADMIN' && schoolId && schoolId !== auth.schoolId) {
    throw new ApiError(403, 'Requested school is outside your admin scope');
  }

  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    if (departmentId && departmentId !== auth.departmentId) {
      throw new ApiError(403, 'Requested department is outside your admin scope');
    }

    if (schoolId && auth.schoolId && schoolId !== auth.schoolId) {
      throw new ApiError(403, 'Requested school is outside your admin scope');
    }
  }
};

const assertMutationScope = (auth: AdminAuth, schoolId: string, departmentId: string | null): void => {
  if (auth.role === 'ROLE_SCHOOL_ADMIN' && schoolId !== auth.schoolId) {
    throw new ApiError(403, 'Requested school is outside your admin scope');
  }

  if (auth.role === 'ROLE_DEPARTMENT_ADMIN') {
    if (!departmentId) {
      throw new ApiError(403, 'Department admins can only manage employees in their department scope');
    }

    if (!auth.departmentId || departmentId !== auth.departmentId) {
      throw new ApiError(403, 'Requested department is outside your admin scope');
    }

    if (auth.schoolId && schoolId !== auth.schoolId) {
      throw new ApiError(403, 'Requested school is outside your admin scope');
    }
  }
};

const resolveScopeTargets = async (schoolId: string, departmentId: string | null) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!school) {
    throw new ApiError(400, 'The selected school does not exist');
  }

  if (!departmentId) {
    return {
      school,
      department: null,
    };
  }

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: {
      id: true,
      name: true,
      schoolId: true,
    },
  });

  if (!department) {
    throw new ApiError(400, 'The selected department does not exist');
  }

  if (department.schoolId !== schoolId) {
    throw new ApiError(400, 'The selected department does not belong to the selected school');
  }

  return {
    school,
    department,
  };
};

const normalizeEmployeeRow = (employee: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  isActive: boolean;
  schoolId: string | null;
  schoolBranch: string | null;
  departmentId: string | null;
  department: string | null;
  position: string | null;
  profileImage: string | null;
  joinDate: Date;
  school: { id: string; name: string } | null;
  departmentModel: { id: string; name: string } | null;
}) => {
  return {
    ...employee,
    joinDate: employee.joinDate.toISOString(),
  };
};

const getEmployeesOrderBy = (
  sortBy: 'firstName' | 'lastName' | 'email' | 'joinDate',
  sortDirection: 'asc' | 'desc',
): Array<Record<string, 'asc' | 'desc'>> => {
  if (sortBy === 'firstName') {
    return [{ firstName: sortDirection }];
  }

  if (sortBy === 'email') {
    return [{ email: sortDirection }];
  }

  if (sortBy === 'joinDate') {
    return [{ joinDate: sortDirection }];
  }

  return [{ lastName: sortDirection }];
};

adminEmployeesRouter.get(
  '/employees',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const query = listEmployeesQuerySchema.parse(req.query);
      assertScopeFilters(auth, query.schoolId, query.departmentId);
      const isActiveFilter =
        query.isActive === undefined ? undefined : query.isActive === 'true';

      const scopedWhere = getScopedUserWhere(auth, 'ROLE_EMPLOYEE');
      const where = {
        ...scopedWhere,
        ...(query.schoolId ? { schoolId: query.schoolId } : {}),
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
        ...(isActiveFilter === undefined ? {} : { isActive: isActiveFilter }),
        ...(query.search
          ? {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' as const } },
                { lastName: { contains: query.search, mode: 'insensitive' as const } },
                { email: { contains: query.search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      };

      const [total, employees] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: employeeSelect,
          orderBy: getEmployeesOrderBy(query.sortBy, query.sortDirection),
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
      ]);

      res.json({
        rows: employees.map(normalizeEmployeeRow),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminEmployeesRouter.get(
  '/employees/:employeeId',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { employeeId } = employeeIdParamsSchema.parse(req.params);
      const scopedWhere = getScopedUserWhere(auth, 'ROLE_EMPLOYEE');
      const employee = await prisma.user.findFirst({
        where: {
          ...scopedWhere,
          id: employeeId,
        },
        select: employeeSelect,
      });

      if (!employee) {
        throw new ApiError(404, 'Employee not found in your scope');
      }

      res.json({
        employee: normalizeEmployeeRow(employee),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminEmployeesRouter.post(
  '/employees',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = createEmployeeBodySchema.parse(req.body);
      const email = payload.email.trim().toLowerCase();
      const departmentId = payload.departmentId ?? null;

      assertMutationScope(auth, payload.schoolId, departmentId);

      const duplicate = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (duplicate) {
        throw new ApiError(409, 'An employee account with this email already exists');
      }

      const { school, department } = await resolveScopeTargets(payload.schoolId, departmentId);
      const passwordHash = await hashPassword(payload.temporaryPassword ?? 'Password123!');

      const employee = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: 'ROLE_EMPLOYEE',
          schoolId: school.id,
          schoolBranch: school.name,
          departmentId: department?.id ?? null,
          department: department?.name ?? null,
          position: payload.position ?? null,
          profileImage: payload.profileImage ?? null,
          adminScopeType: null,
          adminSchoolId: null,
          adminSchoolName: null,
          adminDepartmentId: null,
          adminDepartmentName: null,
        },
        select: employeeSelect,
      });

      res.status(201).json({
        employee: normalizeEmployeeRow(employee),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminEmployeesRouter.patch(
  '/employees/:employeeId',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { employeeId } = employeeIdParamsSchema.parse(req.params);
      const payload = updateEmployeeBodySchema.parse(req.body);
      const scopedWhere = getScopedUserWhere(auth, 'ROLE_EMPLOYEE');

      const existingEmployee = await prisma.user.findFirst({
        where: {
          ...scopedWhere,
          id: employeeId,
        },
        select: {
          id: true,
          email: true,
          schoolId: true,
          departmentId: true,
        },
      });

      if (!existingEmployee) {
        throw new ApiError(404, 'Employee not found in your scope');
      }

      const normalizedEmail = payload.email?.trim().toLowerCase();
      if (normalizedEmail && normalizedEmail !== existingEmployee.email) {
        const duplicate = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });

        if (duplicate) {
          throw new ApiError(409, 'An employee account with this email already exists');
        }
      }

      const targetSchoolId = payload.schoolId ?? existingEmployee.schoolId;
      if (!targetSchoolId) {
        throw new ApiError(400, 'Employee record is missing a school assignment');
      }

      const targetDepartmentId =
        payload.departmentId !== undefined ? payload.departmentId : existingEmployee.departmentId;

      assertMutationScope(auth, targetSchoolId, targetDepartmentId);
      const { school, department } = await resolveScopeTargets(targetSchoolId, targetDepartmentId);

      const employee = await prisma.user.update({
        where: { id: existingEmployee.id },
        data: {
          ...(normalizedEmail ? { email: normalizedEmail } : {}),
          ...(payload.firstName !== undefined ? { firstName: payload.firstName } : {}),
          ...(payload.lastName !== undefined ? { lastName: payload.lastName } : {}),
          ...(payload.position !== undefined ? { position: payload.position } : {}),
          ...(payload.profileImage !== undefined ? { profileImage: payload.profileImage } : {}),
          ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
          schoolId: school.id,
          schoolBranch: school.name,
          departmentId: department?.id ?? null,
          department: department?.name ?? null,
        },
        select: employeeSelect,
      });

      res.json({
        employee: normalizeEmployeeRow(employee),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminEmployeesRouter.patch(
  '/employees/:employeeId/deactivate',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { employeeId } = employeeIdParamsSchema.parse(req.params);
      const payload = deactivateEmployeeBodySchema.parse(req.body);
      const scopedWhere = getScopedUserWhere(auth, 'ROLE_EMPLOYEE');

      const existingEmployee = await prisma.user.findFirst({
        where: {
          ...scopedWhere,
          id: employeeId,
        },
        select: {
          id: true,
          schoolId: true,
          departmentId: true,
        },
      });

      if (!existingEmployee) {
        throw new ApiError(404, 'Employee not found in your scope');
      }

      const targetSchoolId = existingEmployee.schoolId;
      if (!targetSchoolId) {
        throw new ApiError(400, 'Employee record is missing a school assignment');
      }

      assertMutationScope(auth, targetSchoolId, existingEmployee.departmentId);

      const employee = await prisma.user.update({
        where: { id: existingEmployee.id },
        data: {
          isActive: payload.isActive,
        },
        select: employeeSelect,
      });

      res.json({
        employee: normalizeEmployeeRow(employee),
      });
    } catch (error) {
      next(error);
    }
  },
);
