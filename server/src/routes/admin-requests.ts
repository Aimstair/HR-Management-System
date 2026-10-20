import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { getScopedRequestWhere, getScopedUserWhere } from '../lib/scope-filters.js';
import type { AppRole } from '../types/auth.js';
import { applyApprovedAttendanceAppeals } from '../lib/attendance-appeals.js';

export const adminRequestsRouter = Router();

const ADMIN_ROLES: AppRole[] = [
  'ROLE_HEAD_HR',
  'ROLE_CAMPUS_HR',
];

const requestTypeSchema = z.enum([
  'LEAVE',
  'EXPENSE',
  'FUND',
  'OVERTIME',
  'UNDERTIME',
  'TIME_ADJUSTMENT',
  'SHIFT_ASSIGNMENT',
  'SWAP_REQUEST',
]);

const requestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

const listRequestsQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: requestTypeSchema.optional(),
  status: requestStatusSchema.optional(),
  schoolId: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  requestDateFrom: z.string().trim().optional(),
  requestDateTo: z.string().trim().optional(),
  scheduleFrom: z.string().trim().optional(),
  scheduleTo: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
});

const requestIdParamsSchema = z.object({
  requestId: z.string().trim().min(1),
});

const updateRequestStatusBodySchema = z.object({
  status: requestStatusSchema,
  remarks: z.string().trim().max(2000).optional().nullable(),
});

const createRequestBodySchema = z.object({
  type: requestTypeSchema,
  employeeId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  remarks: z.string().trim().max(2000).optional().nullable(),
  leaveStartDate: z.string().trim().optional().nullable(),
  leaveEndDate: z.string().trim().optional().nullable(),
  status: requestStatusSchema.optional(),
});

const bulkUpdateRequestStatusBodySchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(200),
  status: requestStatusSchema,
  remarks: z.string().trim().max(2000).optional().nullable(),
});

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
  if (auth.role === 'ROLE_CAMPUS_HR' && schoolId && schoolId !== auth.schoolId) {
    throw new ApiError(403, 'Requested school is outside your admin scope');
  }

  void departmentId;
};

const normalizeOptionalText = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const parseOptionalDate = (value: string | null | undefined, field: string): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid ${field} date format`);
  }

  return parsed;
};

const normalizeRequestRow = (row: any) => {
  return {
    id: row.requestId,
    type: row.type,
    status: row.status,
    title: row.title,
    description: row.description,
    remarks: row.remarks,
    leaveStartDate: row.leaveStartDate ? row.leaveStartDate.toISOString() : null,
    leaveEndDate: row.leaveEndDate ? row.leaveEndDate.toISOString() : null,
    employeeId: row.employeeId,
    reviewedById: row.reviewedById,
    schoolId: row.campusId,
    departmentId: row.departmentId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    employee: {
      id: row.employee.userId,
      firstName: row.employee.firstName,
      lastName: row.employee.lastName,
      email: row.employee.email,
      position: row.employee.position,
      profileImage: row.employee.profileImage,
    },
    reviewedBy: row.reviewedBy
      ? {
          id: row.reviewedBy.userId,
          firstName: row.reviewedBy.firstName,
          lastName: row.reviewedBy.lastName,
          email: row.reviewedBy.email,
        }
      : null,
    school: {
      id: row.campus.campusId,
      name: row.campus.name,
    },
    department: row.department
      ? {
          id: row.department.departmentId,
          name: row.department.name,
        }
      : null,
  };
};

const requestSelect = {
  requestId: true,
  type: true,
  status: true,
  title: true,
  description: true,
  remarks: true,
  leaveStartDate: true,
  leaveEndDate: true,
  employeeId: true,
  reviewedById: true,
  campusId: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      profileImage: true,
    },
  },
  reviewedBy: {
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  campus: {
    select: {
      campusId: true,
      name: true,
    },
  },
  department: {
    select: {
      departmentId: true,
      name: true,
    },
  },
} as const;

adminRequestsRouter.get(
  '/requests/list',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const query = listRequestsQuerySchema.parse(req.query);
      assertScopeFilters(auth, query.schoolId, query.departmentId);

      const requestDateFrom = parseOptionalDate(query.requestDateFrom, 'requestDateFrom');
      const requestDateTo = parseOptionalDate(query.requestDateTo, 'requestDateTo');
      const scheduleFrom = parseOptionalDate(query.scheduleFrom, 'scheduleFrom');
      const scheduleTo = parseOptionalDate(query.scheduleTo, 'scheduleTo');

      const requestDateFilter = requestDateFrom || requestDateTo
        ? {
            createdAt: {
              ...(requestDateFrom ? { gte: requestDateFrom } : {}),
              ...(requestDateTo ? { lte: requestDateTo } : {}),
            },
          }
        : {};

      const scheduleFilter = scheduleFrom || scheduleTo
        ? scheduleFrom && scheduleTo
          ? {
              AND: [
                { leaveStartDate: { lte: scheduleTo } },
                { leaveEndDate: { gte: scheduleFrom } },
              ],
            }
          : scheduleFrom
            ? { leaveStartDate: { gte: scheduleFrom } }
            : { leaveEndDate: { lte: scheduleTo } }
        : {};

      const scopedWhere = getScopedRequestWhere(auth);
      const where = {
        ...scopedWhere,
        ...(query.type ? { type: query.type } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.schoolId ? { campusId: query.schoolId } : {}),
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
        ...requestDateFilter,
        ...scheduleFilter,
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' as const } },
                { description: { contains: query.search, mode: 'insensitive' as const } },
                { employee: { firstName: { contains: query.search, mode: 'insensitive' as const } } },
                { employee: { lastName: { contains: query.search, mode: 'insensitive' as const } } },
                { employee: { email: { contains: query.search, mode: 'insensitive' as const } } },
              ],
            }
          : {}),
      };

      const [total, rows] = await Promise.all([
        prisma.requestRecord.count({ where }),
        prisma.requestRecord.findMany({
          where,
          select: requestSelect,
          orderBy: [{ createdAt: 'desc' }],
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
      ]);

      res.json({
        rows: rows.map(normalizeRequestRow),
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

adminRequestsRouter.get(
  '/requests/:requestId',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { requestId } = requestIdParamsSchema.parse(req.params);
      const scopedWhere = getScopedRequestWhere(auth);
      const row = await prisma.requestRecord.findFirst({
        where: {
          ...scopedWhere,
          requestId,
        },
        select: requestSelect,
      });

      if (!row) {
        throw new ApiError(404, 'Request not found in your scope');
      }

      res.json({
        request: normalizeRequestRow(row),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRequestsRouter.post(
  '/requests/create',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = createRequestBodySchema.parse(req.body);
      const scopedEmployeeWhere = getScopedUserWhere(auth, 'ROLE_EMPLOYEE');
      const employee = await prisma.user.findFirst({
        where: {
          ...scopedEmployeeWhere,
          userId: payload.employeeId,
        },
        select: {
          userId: true,
          schoolId: true,
          departmentId: true,
        },
      });

      if (!employee || !employee.schoolId) {
        throw new ApiError(404, 'Employee not found in your scope');
      }

      const leaveStartDate = parseOptionalDate(payload.leaveStartDate, 'leaveStartDate');
      const leaveEndDate = parseOptionalDate(payload.leaveEndDate, 'leaveEndDate');

      if (leaveStartDate && leaveEndDate && leaveEndDate < leaveStartDate) {
        throw new ApiError(400, 'Leave end date must be after start date');
      }

      const status = payload.status ?? 'PENDING';

      const row = await prisma.requestRecord.create({
        data: {
          type: payload.type,
          status,
          title: payload.title.trim(),
          description: normalizeOptionalText(payload.description) ?? null,
          remarks: normalizeOptionalText(payload.remarks) ?? null,
          leaveStartDate,
          leaveEndDate,
          employeeId: employee.userId,
          reviewedById: status === 'PENDING' ? null : auth.sub,
          campusId: employee.schoolId,
          departmentId: employee.departmentId ?? null,
        },
        select: requestSelect,
      });

      res.status(201).json({
        request: normalizeRequestRow(row),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRequestsRouter.patch(
  '/requests/:requestId/status',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { requestId } = requestIdParamsSchema.parse(req.params);
      const payload = updateRequestStatusBodySchema.parse(req.body);
      const scopedWhere = getScopedRequestWhere(auth);

      const existing = await prisma.requestRecord.findFirst({
        where: {
          ...scopedWhere,
          requestId,
        },
        select: {
          requestId: true,
          type: true,
          status: true,
          employeeId: true,
          description: true,
        },
      });

      if (!existing) {
        throw new ApiError(404, 'Request not found in your scope');
      }

      const remarks = payload.remarks === undefined
        ? undefined
        : payload.remarks?.trim() || null;

      const row = await prisma.$transaction(async (tx) => {
        const updated = await tx.requestRecord.update({
          where: { requestId },
          data: {
            status: payload.status,
            reviewedById: payload.status === 'PENDING' ? null : auth.sub,
            ...(remarks !== undefined ? { remarks } : {}),
          },
          select: requestSelect,
        });

        if (payload.status === 'APPROVED' && existing.status !== 'APPROVED') {
          await applyApprovedAttendanceAppeals(tx, [existing]);
        }

        return updated;
      });

      res.json({
        request: normalizeRequestRow(row),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRequestsRouter.patch(
  '/requests/bulk-status',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = bulkUpdateRequestStatusBodySchema.parse(req.body);
      const scopedWhere = getScopedRequestWhere(auth);

      const remarks = payload.remarks === undefined
        ? undefined
        : payload.remarks?.trim() || null;

      const visibleRows = await prisma.requestRecord.findMany({
        where: {
          ...scopedWhere,
          requestId: {
            in: payload.ids,
          },
        },
        select: {
          requestId: true,
          type: true,
          status: true,
          employeeId: true,
          description: true,
        },
      });

      const visibleIds = visibleRows.map((row: { requestId: string }) => row.requestId);
      if (visibleIds.length === 0) {
        throw new ApiError(404, 'No matching requests were found in your scope');
      }

      await prisma.$transaction(async (tx) => {
        await tx.requestRecord.updateMany({
          where: {
            requestId: {
              in: visibleIds,
            },
          },
          data: {
            status: payload.status,
            reviewedById: payload.status === 'PENDING' ? null : auth.sub,
            ...(remarks !== undefined ? { remarks } : {}),
          },
        });

        if (payload.status === 'APPROVED') {
          await applyApprovedAttendanceAppeals(
            tx,
            visibleRows.filter((row) => row.status !== 'APPROVED'),
          );
        }
      });

      const rows = await prisma.requestRecord.findMany({
        where: {
          requestId: {
            in: visibleIds,
          },
        },
        select: requestSelect,
      });

      res.json({
        updated: rows.length,
        requests: rows.map(normalizeRequestRow),
      });
    } catch (error) {
      next(error);
    }
  },
);
