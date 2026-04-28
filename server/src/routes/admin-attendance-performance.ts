import {
  EmployeeType,
  NonTeachingAttendanceStatus,
  PerformanceRubricType,
  Prisma,
  TeachingAttendanceStatus,
} from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getScopedSchoolId } from '../lib/scope-filters.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import type { AppRole, AuthTokenPayload } from '../types/auth.js';

export const adminAttendancePerformanceRouter = Router();

const ADMIN_ROLES: AppRole[] = ['ROLE_HEAD_HR', 'ROLE_CAMPUS_HR'];

const baseListQuerySchema = z.object({
  schoolId: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const teachingAttendanceQuerySchema = baseListQuerySchema.extend({
  status: z.nativeEnum(TeachingAttendanceStatus).optional(),
});

const nonTeachingAttendanceQuerySchema = baseListQuerySchema.extend({
  status: z.nativeEnum(NonTeachingAttendanceStatus).optional(),
});

const performanceEvaluationsQuerySchema = baseListQuerySchema.extend({
  rubricType: z.nativeEnum(PerformanceRubricType).optional(),
  employeeType: z.enum(['TEACHING', 'NON_TEACHING']).optional(),
});

const teachingAttendanceCreateBodySchema = z.object({
  employeeId: z.string().trim().min(1),
  classSessionId: z.string().trim().min(1),
  status: z.nativeEnum(TeachingAttendanceStatus),
  remarks: z.string().trim().max(2000).nullable().optional(),
});

const teachingAttendancePatchBodySchema = z
  .object({
    employeeId: z.string().trim().min(1).optional(),
    classSessionId: z.string().trim().min(1).optional(),
    status: z.nativeEnum(TeachingAttendanceStatus).optional(),
    remarks: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided',
  });

const nonTeachingAttendanceCreateBodySchema = z.object({
  employeeId: z.string().trim().min(1),
  schoolId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).nullable().optional(),
  attendanceDate: z.string().trim().min(1),
  status: z.nativeEnum(NonTeachingAttendanceStatus),
  checkInTime: z.string().trim().min(1).nullable().optional(),
  checkOutTime: z.string().trim().min(1).nullable().optional(),
  remarks: z.string().trim().max(2000).nullable().optional(),
});

const nonTeachingAttendancePatchBodySchema = z
  .object({
    employeeId: z.string().trim().min(1).optional(),
    schoolId: z.string().trim().min(1).optional(),
    departmentId: z.string().trim().min(1).nullable().optional(),
    attendanceDate: z.string().trim().min(1).optional(),
    status: z.nativeEnum(NonTeachingAttendanceStatus).optional(),
    checkInTime: z.string().trim().min(1).nullable().optional(),
    checkOutTime: z.string().trim().min(1).nullable().optional(),
    remarks: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided',
  });

const performanceEvaluationCreateBodySchema = z.object({
  employeeId: z.string().trim().min(1),
  schoolId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).nullable().optional(),
  evaluatorId: z.string().trim().min(1).nullable().optional(),
  rubricType: z.nativeEnum(PerformanceRubricType),
  periodStart: z.string().trim().min(1),
  periodEnd: z.string().trim().min(1),
  criteria: z.record(z.unknown()),
  overallScore: z.number().finite(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

const performanceEvaluationPatchBodySchema = z
  .object({
    employeeId: z.string().trim().min(1).optional(),
    schoolId: z.string().trim().min(1).optional(),
    departmentId: z.string().trim().min(1).nullable().optional(),
    evaluatorId: z.string().trim().min(1).nullable().optional(),
    rubricType: z.nativeEnum(PerformanceRubricType).optional(),
    periodStart: z.string().trim().min(1).optional(),
    periodEnd: z.string().trim().min(1).optional(),
    criteria: z.record(z.unknown()).optional(),
    overallScore: z.number().finite().optional(),
    notes: z.string().trim().max(4000).nullable().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field must be provided',
  });

const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

const teachingAttendanceSelect = {
  id: true,
  employeeId: true,
  status: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
    },
  },
  classSession: {
    select: {
      id: true,
      sessionDate: true,
      startsAt: true,
      endsAt: true,
      room: true,
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      school: {
        select: {
          schoolId: true,
          name: true,
        },
      },
      department: {
        select: {
          departmentId: true,
          name: true,
        },
      },
    },
  },
} as const;

const nonTeachingAttendanceSelect = {
  id: true,
  employeeId: true,
  schoolId: true,
  departmentId: true,
  attendanceDate: true,
  status: true,
  checkInTime: true,
  checkOutTime: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
    },
  },
  school: {
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

const performanceEvaluationSelect = {
  id: true,
  employeeId: true,
  schoolId: true,
  departmentId: true,
  evaluatorId: true,
  rubricType: true,
  periodStart: true,
  periodEnd: true,
  criteria: true,
  overallScore: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      employeeType: true,
    },
  },
  evaluator: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  school: {
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

type TeachingAttendanceRow = Prisma.TeachingAttendanceGetPayload<{ select: typeof teachingAttendanceSelect }>;
type NonTeachingAttendanceRow = Prisma.NonTeachingAttendanceGetPayload<{ select: typeof nonTeachingAttendanceSelect }>;
type PerformanceEvaluationRow = Prisma.PerformanceEvaluationGetPayload<{ select: typeof performanceEvaluationSelect }>;

const parseDateOrThrow = (value: string | undefined, field: string): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid ${field} date format`);
  }

  return parsed;
};

const resolveScopedSchoolId = (
  auth: AuthTokenPayload,
  requestedSchoolId?: string,
): string | undefined => {
  const scopedSchoolId = getScopedSchoolId(auth) ?? undefined;

  if (scopedSchoolId && requestedSchoolId && requestedSchoolId !== scopedSchoolId) {
    throw new ApiError(403, 'Requested school is outside your admin scope');
  }

  return requestedSchoolId ?? scopedSchoolId;
};

const normalizeTeachingAttendanceRow = (row: TeachingAttendanceRow) => {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    classSession: {
      ...row.classSession,
      sessionDate: row.classSession.sessionDate.toISOString(),
      startsAt: row.classSession.startsAt.toISOString(),
      endsAt: row.classSession.endsAt.toISOString(),
    },
  };
};

const normalizeNonTeachingAttendanceRow = (row: NonTeachingAttendanceRow) => {
  return {
    ...row,
    attendanceDate: row.attendanceDate.toISOString(),
    checkInTime: row.checkInTime?.toISOString() ?? null,
    checkOutTime: row.checkOutTime?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

const normalizePerformanceEvaluationRow = (row: PerformanceEvaluationRow) => {
  return {
    ...row,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

const parseRequiredDateOrThrow = (value: string, field: string): Date => {
  const parsed = parseDateOrThrow(value, field);
  if (!parsed) {
    throw new ApiError(400, `${field} is required`);
  }
  return parsed;
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

const assertSchoolScope = (auth: AuthTokenPayload, schoolId: string): void => {
  const scopedSchoolId = getScopedSchoolId(auth) ?? undefined;
  if (scopedSchoolId && scopedSchoolId !== schoolId) {
    throw new ApiError(403, 'Requested school is outside your admin scope');
  }
};

const assertDepartmentBelongsToSchool = async (
  departmentId: string | null | undefined,
  schoolId: string,
): Promise<void> => {
  if (!departmentId) {
    return;
  }

  const department = await prisma.department.findUnique({
    where: { departmentId },
    select: { departmentId: true, schoolId: true },
  });

  if (!department) {
    throw new ApiError(400, 'Department does not exist');
  }

  if (department.schoolId !== schoolId) {
    throw new ApiError(400, 'Department does not belong to the selected school');
  }
};

const resolveEmployeeForType = async (
  employeeId: string,
  expectedEmployeeType: EmployeeType,
) => {
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      employeeType: true,
      schoolId: true,
      departmentId: true,
    },
  });

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  if (employee.employeeType !== expectedEmployeeType) {
    throw new ApiError(400, `Employee must be ${expectedEmployeeType.toLowerCase().replace('_', '-')} for this operation`);
  }

  return employee;
};

const resolveTeachingAttendanceTargets = async (
  auth: AuthTokenPayload,
  employeeId: string,
  classSessionId: string,
) => {
  const [employee, classSession] = await Promise.all([
    resolveEmployeeForType(employeeId, EmployeeType.TEACHING),
    prisma.classSession.findUnique({
      where: { id: classSessionId },
      select: {
        id: true,
        schoolId: true,
      },
    }),
  ]);

  if (!classSession) {
    throw new ApiError(404, 'Class session not found');
  }

  assertSchoolScope(auth, classSession.schoolId);

  if (employee.schoolId && employee.schoolId !== classSession.schoolId) {
    throw new ApiError(400, 'Employee school does not match class session school');
  }
};

const resolveNonTeachingAttendancePayload = async (
  auth: AuthTokenPayload,
  payload: {
    employeeId: string;
    schoolId?: string;
    departmentId?: string | null;
    attendanceDate: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
  },
) => {
  const employee = await resolveEmployeeForType(payload.employeeId, EmployeeType.NON_TEACHING);

  const resolvedSchoolId = payload.schoolId ?? employee.schoolId;
  if (!resolvedSchoolId) {
    throw new ApiError(400, 'schoolId is required for non-teaching attendance');
  }

  if (employee.schoolId && employee.schoolId !== resolvedSchoolId) {
    throw new ApiError(400, 'Employee school does not match the selected school');
  }

  assertSchoolScope(auth, resolvedSchoolId);
  await assertDepartmentBelongsToSchool(payload.departmentId, resolvedSchoolId);

  if (employee.departmentId && payload.departmentId && payload.departmentId !== employee.departmentId) {
    throw new ApiError(400, 'Employee department does not match the selected department');
  }

  const attendanceDate = parseRequiredDateOrThrow(payload.attendanceDate, 'attendanceDate');
  const checkInTime = payload.checkInTime === null
    ? null
    : payload.checkInTime
      ? parseRequiredDateOrThrow(payload.checkInTime, 'checkInTime')
      : null;
  const checkOutTime = payload.checkOutTime === null
    ? null
    : payload.checkOutTime
      ? parseRequiredDateOrThrow(payload.checkOutTime, 'checkOutTime')
      : null;

  if (checkInTime && checkOutTime && checkOutTime.getTime() < checkInTime.getTime()) {
    throw new ApiError(400, 'checkOutTime cannot be earlier than checkInTime');
  }

  return {
    schoolId: resolvedSchoolId,
    attendanceDate,
    checkInTime,
    checkOutTime,
  };
};

const resolvePerformanceTargets = async (
  auth: AuthTokenPayload,
  payload: {
    employeeId: string;
    schoolId?: string;
    departmentId?: string | null;
    evaluatorId?: string | null;
    rubricType: PerformanceRubricType;
    periodStart: string;
    periodEnd: string;
  },
) => {
  const expectedEmployeeType =
    payload.rubricType === PerformanceRubricType.TEACHING
      ? EmployeeType.TEACHING
      : EmployeeType.NON_TEACHING;

  const employee = await resolveEmployeeForType(payload.employeeId, expectedEmployeeType);

  const resolvedSchoolId = payload.schoolId ?? employee.schoolId;
  if (!resolvedSchoolId) {
    throw new ApiError(400, 'schoolId is required for performance evaluations');
  }

  if (employee.schoolId && employee.schoolId !== resolvedSchoolId) {
    throw new ApiError(400, 'Employee school does not match the selected school');
  }

  assertSchoolScope(auth, resolvedSchoolId);
  await assertDepartmentBelongsToSchool(payload.departmentId, resolvedSchoolId);

  if (employee.departmentId && payload.departmentId && payload.departmentId !== employee.departmentId) {
    throw new ApiError(400, 'Employee department does not match the selected department');
  }

  const periodStart = parseRequiredDateOrThrow(payload.periodStart, 'periodStart');
  const periodEnd = parseRequiredDateOrThrow(payload.periodEnd, 'periodEnd');

  if (periodEnd.getTime() < periodStart.getTime()) {
    throw new ApiError(400, 'periodEnd cannot be earlier than periodStart');
  }

  const resolvedEvaluatorId = payload.evaluatorId ?? auth.sub;
  const evaluator = await prisma.user.findUnique({
    where: { id: resolvedEvaluatorId },
    select: { id: true },
  });

  if (!evaluator) {
    throw new ApiError(400, 'Evaluator does not exist');
  }

  return {
    schoolId: resolvedSchoolId,
    evaluatorId: resolvedEvaluatorId,
    periodStart,
    periodEnd,
  };
};

const toWriteApiError = (error: unknown): unknown => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return new ApiError(400, 'A record with the same unique keys already exists');
  }

  return error;
};

adminAttendancePerformanceRouter.get(
  '/attendance/teaching',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const query = teachingAttendanceQuerySchema.parse(req.query);
      const fromDate = parseDateOrThrow(query.from, 'from');
      const toDate = parseDateOrThrow(query.to, 'to');
      const schoolId = resolveScopedSchoolId(auth, query.schoolId);

      const where = {
        ...(query.employeeId ? { employeeId: query.employeeId } : {}),
        ...(query.status ? { status: query.status } : {}),
        employee: { employeeType: 'TEACHING' as const },
        classSession: {
          ...(schoolId ? { schoolId } : {}),
          ...(query.departmentId ? { departmentId: query.departmentId } : {}),
          ...((fromDate || toDate)
            ? {
                sessionDate: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
      };

      const [total, rows] = await Promise.all([
        prisma.teachingAttendance.count({ where }),
        prisma.teachingAttendance.findMany({
          where,
          orderBy: [
            { classSession: { sessionDate: 'desc' } },
            { classSession: { startsAt: 'desc' } },
          ],
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          select: teachingAttendanceSelect,
        }),
      ]);

      res.json({
        rows: rows.map(normalizeTeachingAttendanceRow),
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

adminAttendancePerformanceRouter.get(
  '/attendance/non-teaching',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const query = nonTeachingAttendanceQuerySchema.parse(req.query);
      const fromDate = parseDateOrThrow(query.from, 'from');
      const toDate = parseDateOrThrow(query.to, 'to');
      const schoolId = resolveScopedSchoolId(auth, query.schoolId);

      const where = {
        ...(query.employeeId ? { employeeId: query.employeeId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(schoolId ? { schoolId } : {}),
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
        ...((fromDate || toDate)
          ? {
              attendanceDate: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
        employee: { employeeType: 'NON_TEACHING' as const },
      };

      const [total, rows] = await Promise.all([
        prisma.nonTeachingAttendance.count({ where }),
        prisma.nonTeachingAttendance.findMany({
          where,
          orderBy: [{ attendanceDate: 'desc' }],
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          select: nonTeachingAttendanceSelect,
        }),
      ]);

      res.json({
        rows: rows.map(normalizeNonTeachingAttendanceRow),
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

adminAttendancePerformanceRouter.get(
  '/performance-evaluations',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const query = performanceEvaluationsQuerySchema.parse(req.query);
      const fromDate = parseDateOrThrow(query.from, 'from');
      const toDate = parseDateOrThrow(query.to, 'to');
      const schoolId = resolveScopedSchoolId(auth, query.schoolId);

      const inferredRubricType =
        query.rubricType ??
        (query.employeeType === 'TEACHING'
          ? PerformanceRubricType.TEACHING
          : query.employeeType === 'NON_TEACHING'
          ? PerformanceRubricType.NON_TEACHING
          : undefined);

      const where = {
        ...(query.employeeId ? { employeeId: query.employeeId } : {}),
        ...(schoolId ? { schoolId } : {}),
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
        ...(inferredRubricType ? { rubricType: inferredRubricType } : {}),
        ...((fromDate || toDate)
          ? {
              periodStart: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
        ...(query.employeeType
          ? {
              employee: {
                employeeType: query.employeeType,
              },
            }
          : {}),
      };

      const [total, rows] = await Promise.all([
        prisma.performanceEvaluation.count({ where }),
        prisma.performanceEvaluation.findMany({
          where,
          orderBy: [{ periodEnd: 'desc' }, { createdAt: 'desc' }],
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          select: performanceEvaluationSelect,
        }),
      ]);

      res.json({
        rows: rows.map(normalizePerformanceEvaluationRow),
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

adminAttendancePerformanceRouter.post(
  '/attendance/teaching',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = teachingAttendanceCreateBodySchema.parse(req.body);
      await resolveTeachingAttendanceTargets(auth, payload.employeeId, payload.classSessionId);

      const row = await prisma.teachingAttendance.create({
        data: {
          employeeId: payload.employeeId,
          classSessionId: payload.classSessionId,
          status: payload.status,
          remarks: normalizeOptionalText(payload.remarks) ?? null,
        },
        select: teachingAttendanceSelect,
      });

      res.status(201).json({
        attendance: normalizeTeachingAttendanceRow(row),
      });
    } catch (error) {
      next(toWriteApiError(error));
    }
  },
);

adminAttendancePerformanceRouter.patch(
  '/attendance/teaching/:id',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { id } = idParamSchema.parse(req.params);
      const payload = teachingAttendancePatchBodySchema.parse(req.body);

      const existing = await prisma.teachingAttendance.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          classSessionId: true,
          classSession: {
            select: {
              schoolId: true,
            },
          },
        },
      });

      if (!existing) {
        throw new ApiError(404, 'Teaching attendance record not found');
      }

      assertSchoolScope(auth, existing.classSession.schoolId);

      const targetEmployeeId = payload.employeeId ?? existing.employeeId;
      const targetClassSessionId = payload.classSessionId ?? existing.classSessionId;
      await resolveTeachingAttendanceTargets(auth, targetEmployeeId, targetClassSessionId);

      const row = await prisma.teachingAttendance.update({
        where: { id },
        data: {
          employeeId: targetEmployeeId,
          classSessionId: targetClassSessionId,
          status: payload.status,
          remarks: normalizeOptionalText(payload.remarks),
        },
        select: teachingAttendanceSelect,
      });

      res.json({
        attendance: normalizeTeachingAttendanceRow(row),
      });
    } catch (error) {
      next(toWriteApiError(error));
    }
  },
);

adminAttendancePerformanceRouter.post(
  '/attendance/non-teaching',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = nonTeachingAttendanceCreateBodySchema.parse(req.body);
      const resolved = await resolveNonTeachingAttendancePayload(auth, payload);

      const row = await prisma.nonTeachingAttendance.create({
        data: {
          employeeId: payload.employeeId,
          schoolId: resolved.schoolId,
          departmentId: payload.departmentId ?? null,
          attendanceDate: resolved.attendanceDate,
          status: payload.status,
          checkInTime: resolved.checkInTime,
          checkOutTime: resolved.checkOutTime,
          remarks: normalizeOptionalText(payload.remarks) ?? null,
        },
        select: nonTeachingAttendanceSelect,
      });

      res.status(201).json({
        attendance: normalizeNonTeachingAttendanceRow(row),
      });
    } catch (error) {
      next(toWriteApiError(error));
    }
  },
);

adminAttendancePerformanceRouter.patch(
  '/attendance/non-teaching/:id',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { id } = idParamSchema.parse(req.params);
      const payload = nonTeachingAttendancePatchBodySchema.parse(req.body);

      const existing = await prisma.nonTeachingAttendance.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          schoolId: true,
          departmentId: true,
          attendanceDate: true,
          checkInTime: true,
          checkOutTime: true,
        },
      });

      if (!existing) {
        throw new ApiError(404, 'Non-teaching attendance record not found');
      }

      assertSchoolScope(auth, existing.schoolId);

      const targetEmployeeId = payload.employeeId ?? existing.employeeId;
      const targetSchoolId = payload.schoolId ?? existing.schoolId;
      const targetDepartmentId = payload.departmentId === undefined ? existing.departmentId : payload.departmentId;
      const targetAttendanceDate = payload.attendanceDate ?? existing.attendanceDate.toISOString();
      const targetCheckIn = payload.checkInTime === undefined ? existing.checkInTime?.toISOString() ?? null : payload.checkInTime;
      const targetCheckOut = payload.checkOutTime === undefined ? existing.checkOutTime?.toISOString() ?? null : payload.checkOutTime;

      const resolved = await resolveNonTeachingAttendancePayload(auth, {
        employeeId: targetEmployeeId,
        schoolId: targetSchoolId,
        departmentId: targetDepartmentId,
        attendanceDate: targetAttendanceDate,
        checkInTime: targetCheckIn,
        checkOutTime: targetCheckOut,
      });

      const row = await prisma.nonTeachingAttendance.update({
        where: { id },
        data: {
          employeeId: targetEmployeeId,
          schoolId: resolved.schoolId,
          departmentId: targetDepartmentId,
          attendanceDate: resolved.attendanceDate,
          status: payload.status,
          checkInTime: payload.checkInTime === undefined ? undefined : resolved.checkInTime,
          checkOutTime: payload.checkOutTime === undefined ? undefined : resolved.checkOutTime,
          remarks: normalizeOptionalText(payload.remarks),
        },
        select: nonTeachingAttendanceSelect,
      });

      res.json({
        attendance: normalizeNonTeachingAttendanceRow(row),
      });
    } catch (error) {
      next(toWriteApiError(error));
    }
  },
);

adminAttendancePerformanceRouter.post(
  '/performance-evaluations',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const payload = performanceEvaluationCreateBodySchema.parse(req.body);
      const resolved = await resolvePerformanceTargets(auth, payload);
      const criteria = payload.criteria as Prisma.InputJsonValue;

      const row = await prisma.performanceEvaluation.create({
        data: {
          employeeId: payload.employeeId,
          schoolId: resolved.schoolId,
          departmentId: payload.departmentId ?? null,
          evaluatorId: resolved.evaluatorId,
          rubricType: payload.rubricType,
          periodStart: resolved.periodStart,
          periodEnd: resolved.periodEnd,
          criteria,
          overallScore: payload.overallScore,
          notes: normalizeOptionalText(payload.notes) ?? null,
        },
        select: performanceEvaluationSelect,
      });

      res.status(201).json({
        evaluation: normalizePerformanceEvaluationRow(row),
      });
    } catch (error) {
      next(toWriteApiError(error));
    }
  },
);

adminAttendancePerformanceRouter.patch(
  '/performance-evaluations/:id',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const { id } = idParamSchema.parse(req.params);
      const payload = performanceEvaluationPatchBodySchema.parse(req.body);

      const existing = await prisma.performanceEvaluation.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          schoolId: true,
          departmentId: true,
          evaluatorId: true,
          rubricType: true,
          periodStart: true,
          periodEnd: true,
        },
      });

      if (!existing) {
        throw new ApiError(404, 'Performance evaluation not found');
      }

      assertSchoolScope(auth, existing.schoolId);

      const targetPayload = {
        employeeId: payload.employeeId ?? existing.employeeId,
        schoolId: payload.schoolId ?? existing.schoolId,
        departmentId: payload.departmentId === undefined ? existing.departmentId : payload.departmentId,
        evaluatorId: payload.evaluatorId === undefined ? existing.evaluatorId : payload.evaluatorId,
        rubricType: payload.rubricType ?? existing.rubricType,
        periodStart: payload.periodStart ?? existing.periodStart.toISOString(),
        periodEnd: payload.periodEnd ?? existing.periodEnd.toISOString(),
      };

      const resolved = await resolvePerformanceTargets(auth, targetPayload);
      const criteria = payload.criteria === undefined
        ? undefined
        : (payload.criteria as Prisma.InputJsonValue);

      const row = await prisma.performanceEvaluation.update({
        where: { id },
        data: {
          employeeId: targetPayload.employeeId,
          schoolId: resolved.schoolId,
          departmentId: targetPayload.departmentId,
          evaluatorId: resolved.evaluatorId,
          rubricType: targetPayload.rubricType,
          periodStart: resolved.periodStart,
          periodEnd: resolved.periodEnd,
          criteria,
          overallScore: payload.overallScore,
          notes: normalizeOptionalText(payload.notes),
        },
        select: performanceEvaluationSelect,
      });

      res.json({
        evaluation: normalizePerformanceEvaluationRow(row),
      });
    } catch (error) {
      next(toWriteApiError(error));
    }
  },
);
