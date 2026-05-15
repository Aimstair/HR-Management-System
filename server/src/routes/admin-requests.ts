import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { getScopedRequestWhere } from '../lib/scope-filters.js';
import type { AppRole } from '../types/auth.js';

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
  'WFH',
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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
});

const requestIdParamsSchema = z.object({
  requestId: z.string().trim().min(1),
});

const updateRequestStatusBodySchema = z.object({
  status: requestStatusSchema,
});

const bulkUpdateRequestStatusBodySchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(200),
  status: requestStatusSchema,
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

const normalizeRequestRow = (row: {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  leaveStartDate: Date | null;
  leaveEndDate: Date | null;
  employeeId: string;
  reviewedById: string | null;
  schoolId: string;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
    profileImage: string | null;
  };
  reviewedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  school: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
}) => {
  return {
    ...row,
    leaveStartDate: row.leaveStartDate ? row.leaveStartDate.toISOString() : null,
    leaveEndDate: row.leaveEndDate ? row.leaveEndDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

const requestSelect = {
  id: true,
  type: true,
  status: true,
  title: true,
  description: true,
  leaveStartDate: true,
  leaveEndDate: true,
  employeeId: true,
  reviewedById: true,
  schoolId: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      profileImage: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  school: {
    select: {
      id: true,
      name: true,
    },
  },
  department: {
    select: {
      id: true,
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

      const scopedWhere = getScopedRequestWhere(auth);
      const where = {
        ...scopedWhere,
        ...(query.type ? { type: query.type } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.schoolId ? { schoolId: query.schoolId } : {}),
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
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
          id: requestId,
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
          id: requestId,
        },
        select: {
          id: true,
        },
      });

      if (!existing) {
        throw new ApiError(404, 'Request not found in your scope');
      }

      const row = await prisma.requestRecord.update({
        where: { id: requestId },
        data: {
          status: payload.status,
          reviewedById: payload.status === 'PENDING' ? null : auth.sub,
        },
        select: requestSelect,
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

      const visibleRows = await prisma.requestRecord.findMany({
        where: {
          ...scopedWhere,
          id: {
            in: payload.ids,
          },
        },
        select: {
          id: true,
        },
      });

      const visibleIds = visibleRows.map((row: { id: string }) => row.id);
      if (visibleIds.length === 0) {
        throw new ApiError(404, 'No matching requests were found in your scope');
      }

      await prisma.requestRecord.updateMany({
        where: {
          id: {
            in: visibleIds,
          },
        },
        data: {
          status: payload.status,
          reviewedById: payload.status === 'PENDING' ? null : auth.sub,
        },
      });

      const rows = await prisma.requestRecord.findMany({
        where: {
          id: {
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
