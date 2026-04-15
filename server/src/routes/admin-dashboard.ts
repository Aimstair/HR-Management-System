import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { getScopedRequestWhere, getScopedShiftWhere, getScopedUserWhere } from '../lib/scope-filters.js';
import type { AppRole } from '../types/auth.js';

export const adminDashboardRouter = Router();

const ADMIN_ROLES: AppRole[] = [
  'ROLE_HEAD_ADMIN',
  'ROLE_SCHOOL_ADMIN',
  'ROLE_DEPARTMENT_ADMIN',
];

adminDashboardRouter.get(
  '/dashboard/metrics',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const [totalEmployees, pendingRequests, activeShifts, recentMemos] = await Promise.all([
        prisma.user.count({
          where: {
            ...getScopedUserWhere(auth, 'ROLE_EMPLOYEE'),
            isActive: true,
          },
        }),
        prisma.requestRecord.count({
          where: {
            ...getScopedRequestWhere(auth),
            status: 'PENDING',
          },
        }),
        prisma.shift.count({
          where: getScopedShiftWhere(auth),
        }),
        prisma.memo.findMany({
          where:
            auth.role === 'ROLE_HEAD_ADMIN'
              ? {}
              : auth.role === 'ROLE_SCHOOL_ADMIN'
                ? { schoolId: auth.schoolId ?? undefined }
                : { departmentId: auth.departmentId ?? undefined },
          select: {
            id: true,
            title: true,
            publishedAt: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: 5,
        }),
      ]);

      res.json({
        totalEmployees,
        pendingRequests,
        activeShifts,
        recentMemos: recentMemos.map((memo: { id: string; title: string; publishedAt: Date }) => ({
          ...memo,
          publishedAt: memo.publishedAt.toISOString(),
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);
