import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import type { AppRole, AuthTokenPayload } from '../types/auth.js';

export const adminOrganizationRouter = Router();

const ADMIN_ROLES: AppRole[] = ['ROLE_HEAD_HR', 'ROLE_CAMPUS_HR'];

const campusCreateSchema = z.object({
  campusId: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  address: z.string().trim().nullable().optional(),
  contact: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  picture: z.string().trim().url().nullable().optional(),
});

const campusUpdateSchema = z
  .object({
    code: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    address: z.string().trim().nullable().optional(),
    contact: z.string().trim().nullable().optional(),
    email: z.string().trim().email().nullable().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    picture: z.string().trim().url().nullable().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided for update',
  });

const schoolCreateSchema = z.object({
  schoolId: z.string().trim().min(1).optional(),
  campusId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  location: z.string().trim().nullable().optional(),
  contact: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  picture: z.string().trim().url().nullable().optional(),
});

const schoolUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    location: z.string().trim().nullable().optional(),
    contact: z.string().trim().nullable().optional(),
    email: z.string().trim().email().nullable().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    picture: z.string().trim().url().nullable().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided for update',
  });

const departmentCreateSchema = z.object({
  departmentId: z.string().trim().min(1).optional(),
  campusId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  location: z.string().trim().nullable().optional(),
  contact: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  picture: z.string().trim().url().nullable().optional(),
});

const departmentUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    location: z.string().trim().nullable().optional(),
    contact: z.string().trim().nullable().optional(),
    email: z.string().trim().email().nullable().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    picture: z.string().trim().url().nullable().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided for update',
  });

const ensureCampusScope = (auth: AuthTokenPayload, campusId: string): void => {
  if (auth.role === 'ROLE_CAMPUS_HR') {
    if (!auth.schoolId) {
      throw new ApiError(403, 'Campus HR account is missing school scope configuration');
    }

    if (auth.schoolId !== campusId) {
      throw new ApiError(403, 'Requested campus is outside your admin scope');
    }
  }
};

const toSlug = (value: string): string => {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 20);
};

const buildCampusId = (payload: { campusId?: string; code?: string; name: string }): string => {
  if (payload.campusId) {
    return payload.campusId;
  }

  const base = payload.code ? payload.code : payload.name;
  return `SCHOOL-${toSlug(base)}`;
};

const buildSchoolId = (payload: { schoolId?: string; name: string }): string => {
  if (payload.schoolId) {
    return payload.schoolId;
  }

  return `SCH-${toSlug(payload.name)}`;
};

const buildDepartmentId = (payload: { departmentId?: string; name: string }): string => {
  if (payload.departmentId) {
    return payload.departmentId;
  }

  return `DEPT-${toSlug(payload.name)}`;
};

const campusSelect = {
  campusId: true,
  name: true,
  code: true,
  address: true,
  contact: true,
  email: true,
  status: true,
  picture: true,
  schools: {
    select: {
      schoolId: true,
      name: true,
      type: true,
      location: true,
      contact: true,
      email: true,
      status: true,
      picture: true,
      departments: {
        select: {
          departmentId: true,
          name: true,
          location: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
          schoolId: true,
        },
      },
    },
  },
} as const;

const normalizeSchool = (school: {
  schoolId: string;
  name: string;
  campusId: string;
  type: 'TEACHING' | 'NON_TEACHING';
  location: string | null;
  contact: string | null;
  email: string | null;
  status: string;
  picture: string | null;
  departments?: Array<{
    departmentId: string;
    name: string;
    schoolId: string;
    location: string | null;
    contact: string | null;
    email: string | null;
    status: string;
    picture: string | null;
  }>;
}) => {
  return {
    id: school.schoolId,
    name: school.name,
    campusId: school.campusId,
    type: school.type,
    location: school.location,
    contact: school.contact,
    email: school.email,
    status: school.status,
    picture: school.picture,
    departments: school.departments
      ? school.departments.map((department) => normalizeDepartment(department))
      : undefined,
  };
};

const normalizeDepartment = (department: {
  departmentId: string;
  name: string;
  schoolId: string;
  location: string | null;
  contact: string | null;
  email: string | null;
  status: string;
  picture: string | null;
}) => {
  return {
    id: department.departmentId,
    name: department.name,
    schoolId: department.schoolId,
    location: department.location,
    contact: department.contact,
    email: department.email,
    status: department.status,
    picture: department.picture,
  };
};

adminOrganizationRouter.get(
  '/organization/campuses',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const campuses = await prisma.campus.findMany({
        where: auth.role === 'ROLE_CAMPUS_HR' ? { campusId: auth.schoolId ?? undefined } : {},
        orderBy: { name: 'asc' },
        select: campusSelect,
      });

      const normalized = campuses.map((campus) => {
        const teachingSchools = campus.schools
          .filter((school) => school.type === 'TEACHING')
          .map((school) =>
            normalizeSchool({
              ...school,
              campusId: campus.campusId,
              departments: school.departments.map((department) => ({
                ...department,
                schoolId: school.schoolId,
              })),
            }),
          );
        const nonTeachingDepartments = campus.schools
          .filter((school) => school.type === 'NON_TEACHING')
          .flatMap((school) =>
            school.departments.map((department) =>
              normalizeDepartment({ ...department, schoolId: school.schoolId }),
            ),
          );

        return {
          id: campus.campusId,
          name: campus.name,
          code: campus.code,
          address: campus.address,
          contact: campus.contact,
          email: campus.email,
          status: campus.status,
          picture: campus.picture,
          teachingSchools,
          nonTeachingDepartments,
        };
      });

      res.json({ campuses: normalized });
    } catch (error) {
      next(error);
    }
  },
);

adminOrganizationRouter.post(
  '/organization/campuses',
  requireAuth,
  requireRoles('ROLE_HEAD_HR'),
  async (req, res, next) => {
    try {
      const payload = campusCreateSchema.parse(req.body);
      const campusId = buildCampusId(payload);

      const campus = await prisma.campus.create({
        data: {
          campusId,
          name: payload.name,
          code: payload.code ?? null,
          address: payload.address ?? null,
          contact: payload.contact ?? null,
          email: payload.email ?? null,
          status: payload.status ?? 'Active',
          picture: payload.picture ?? null,
        },
        select: {
          campusId: true,
          name: true,
          code: true,
          address: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
        },
      });

      await prisma.school.create({
        data: {
          schoolId: `SCH-NT-${toSlug(payload.code ?? payload.name)}`,
          name: 'Non-Teaching Departments',
          campusId: campus.campusId,
          type: 'NON_TEACHING',
          location: campus.name,
          contact: campus.contact,
          email: campus.email ? campus.email.replace('@', '+support@') : null,
          status: 'Active',
          picture: campus.picture,
        },
      });

      res.status(201).json({
        campus: {
          id: campus.campusId,
          name: campus.name,
          code: campus.code,
          address: campus.address,
          contact: campus.contact,
          email: campus.email,
          status: campus.status,
          picture: campus.picture,
          teachingSchools: [],
          nonTeachingDepartments: [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminOrganizationRouter.patch(
  '/organization/campuses/:campusId',
  requireAuth,
  requireRoles('ROLE_HEAD_HR'),
  async (req, res, next) => {
    try {
      const { campusId } = z.object({ campusId: z.string().trim().min(1) }).parse(req.params);
      const payload = campusUpdateSchema.parse(req.body);

      const campus = await prisma.campus.update({
        where: { campusId },
        data: {
          ...(payload.code !== undefined ? { code: payload.code } : {}),
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.address !== undefined ? { address: payload.address } : {}),
          ...(payload.contact !== undefined ? { contact: payload.contact } : {}),
          ...(payload.email !== undefined ? { email: payload.email } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
          ...(payload.picture !== undefined ? { picture: payload.picture } : {}),
        },
        select: {
          campusId: true,
          name: true,
          code: true,
          address: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
        },
      });

      res.json({
        campus: {
          id: campus.campusId,
          name: campus.name,
          code: campus.code,
          address: campus.address,
          contact: campus.contact,
          email: campus.email,
          status: campus.status,
          picture: campus.picture,
          teachingSchools: [],
          nonTeachingDepartments: [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminOrganizationRouter.post(
  '/organization/schools',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = schoolCreateSchema.parse(req.body);
      ensureCampusScope(auth, payload.campusId);

      const schoolId = buildSchoolId(payload);

      const school = await prisma.school.create({
        data: {
          schoolId,
          name: payload.name,
          campusId: payload.campusId,
          type: 'TEACHING',
          location: payload.location ?? null,
          contact: payload.contact ?? null,
          email: payload.email ?? null,
          status: payload.status ?? 'Active',
          picture: payload.picture ?? null,
        },
        select: {
          schoolId: true,
          name: true,
          campusId: true,
          type: true,
          location: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
        },
      });

      res.status(201).json({ school: normalizeSchool(school) });
    } catch (error) {
      next(error);
    }
  },
);

adminOrganizationRouter.patch(
  '/organization/schools/:schoolId',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { schoolId } = z.object({ schoolId: z.string().trim().min(1) }).parse(req.params);
      const payload = schoolUpdateSchema.parse(req.body);

      const existing = await prisma.school.findUnique({
        where: { schoolId },
        select: { campusId: true, type: true },
      });

      if (!existing) {
        throw new ApiError(404, 'School not found');
      }

      ensureCampusScope(auth, existing.campusId);

      if (existing.type === 'NON_TEACHING') {
        throw new ApiError(400, 'Non-teaching schools cannot be edited via this endpoint');
      }

      const school = await prisma.school.update({
        where: { schoolId },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.location !== undefined ? { location: payload.location } : {}),
          ...(payload.contact !== undefined ? { contact: payload.contact } : {}),
          ...(payload.email !== undefined ? { email: payload.email } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
          ...(payload.picture !== undefined ? { picture: payload.picture } : {}),
        },
        select: {
          schoolId: true,
          name: true,
          campusId: true,
          type: true,
          location: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
        },
      });

      res.json({ school: normalizeSchool(school) });
    } catch (error) {
      next(error);
    }
  },
);

adminOrganizationRouter.post(
  '/organization/departments',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = departmentCreateSchema.parse(req.body);
      ensureCampusScope(auth, payload.campusId);

      const school = await prisma.school.findFirst({
        where: {
          campusId: payload.campusId,
          type: 'NON_TEACHING',
        },
        select: { schoolId: true },
      });

      if (!school) {
        throw new ApiError(400, 'Non-teaching school is missing for this campus');
      }

      const departmentId = buildDepartmentId(payload);

      const department = await prisma.department.create({
        data: {
          departmentId,
          name: payload.name,
          schoolId: school.schoolId,
          location: payload.location ?? null,
          contact: payload.contact ?? null,
          email: payload.email ?? null,
          status: payload.status ?? 'Active',
          picture: payload.picture ?? null,
        },
        select: {
          departmentId: true,
          name: true,
          schoolId: true,
          location: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
        },
      });

      res.status(201).json({ department: normalizeDepartment(department) });
    } catch (error) {
      next(error);
    }
  },
);

adminOrganizationRouter.patch(
  '/organization/departments/:departmentId',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { departmentId } = z.object({ departmentId: z.string().trim().min(1) }).parse(req.params);
      const payload = departmentUpdateSchema.parse(req.body);

      const existing = await prisma.department.findUnique({
        where: { departmentId },
        select: { school: { select: { campusId: true, type: true } } },
      });

      if (!existing) {
        throw new ApiError(404, 'Department not found');
      }

      ensureCampusScope(auth, existing.school.campusId);

      if (existing.school.type !== 'NON_TEACHING') {
        throw new ApiError(400, 'Teaching departments are managed within teaching schools');
      }

      const department = await prisma.department.update({
        where: { departmentId },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.location !== undefined ? { location: payload.location } : {}),
          ...(payload.contact !== undefined ? { contact: payload.contact } : {}),
          ...(payload.email !== undefined ? { email: payload.email } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
          ...(payload.picture !== undefined ? { picture: payload.picture } : {}),
        },
        select: {
          departmentId: true,
          name: true,
          schoolId: true,
          location: true,
          contact: true,
          email: true,
          status: true,
          picture: true,
        },
      });

      res.json({ department: normalizeDepartment(department) });
    } catch (error) {
      next(error);
    }
  },
);
