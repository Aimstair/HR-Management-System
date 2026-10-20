import { Router } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import type { AppRole } from '../types/auth.js';
import { getAdminAcknowledgementWhere, getAdminMemoWhere } from '../lib/memo-visibility.js';
import { memoRequiresAcknowledgement } from '../lib/memo-rules.js';

export const adminMemosRouter = Router();

const ADMIN_ROLES: AppRole[] = ['ROLE_HEAD_HR', 'ROLE_CAMPUS_HR'];

const listMemosQuerySchema = z.object({
  search: z.string().trim().optional(),
});

const recipientTypeSchema = z.enum(['All', 'Campus', 'School', 'Department', 'Employees']);

const createMemoBodySchema = z.object({
  memoType: z.string().trim().min(1),
  agenda: z.string().trim().min(1),
  content: z.string().trim().min(1),
  attachments: z.array(z.string().trim().min(1)).optional(),
  dateCreated: z.string().trim().optional(),
  effectiveDate: z.string().trim().optional(),
  recipientType: recipientTypeSchema,
  recipientIds: z.array(z.string().trim().min(1)).optional(),
});

type AdminAuth = {
  sub: string;
  role: AppRole;
  schoolId: string | null;
  departmentId: string | null;
};

const MEMO_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'memos');
const MEMO_MAX_ATTACHMENTS = 5;
const MEMO_MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MEMO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const sanitizeFileName = (name: string): string => {
  const trimmed = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  return trimmed.length > 80 ? trimmed.slice(0, 80) : trimmed;
};

const memoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(MEMO_UPLOAD_DIR, { recursive: true });
    cb(null, MEMO_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = sanitizeFileName(path.basename(file.originalname, ext));
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${stamp}-${base}${ext || ''}`);
  },
});

const memoUpload = multer({
  storage: memoStorage,
  limits: {
    fileSize: MEMO_MAX_FILE_SIZE,
    files: MEMO_MAX_ATTACHMENTS,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MEMO_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, 'Unsupported attachment type'));
      return;
    }
    cb(null, true);
  },
});

const parseDate = (value: string | undefined, fallback: Date, label: string): Date => {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid ${label} date`);
  }

  return parsed;
};

const memoSelect = {
  memoId: true,
  memoType: true,
  title: true,
  content: true,
  attachments: true,
  effectiveDate: true,
  scopeType: true,
  campusId: true,
  schoolId: true,
  departmentId: true,
  recipientEmployeeId: true,
  publishedAt: true,
  campus: {
    select: {
      campusId: true,
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
  recipientEmployee: {
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      position: true,
      profileImage: true,
    },
  },
  acknowledgements: {
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          position: true,
          profileImage: true,
        },
      },
    },
  },
} as const;

const normalizeMemoRow = (row: any) => {
  const status = row.effectiveDate.getTime() > Date.now() ? 'Upcoming' : 'Sent';

  const recipients = row.recipientEmployee
    ? [
        {
          id: row.recipientEmployee.userId,
          name: `${row.recipientEmployee.firstName} ${row.recipientEmployee.lastName}`.trim(),
          type: 'Employees' as const,
          position: row.recipientEmployee.position ?? 'Unassigned',
          avatarUrl: row.recipientEmployee.profileImage ?? undefined,
        },
      ]
    : row.scopeType === 'GLOBAL'
      ? [{ id: 'ALL', name: 'All Employees', type: 'All' as const }]
      : row.department
        ? [{ id: row.department.departmentId, name: row.department.name, type: 'Department' as const }]
        : row.school
          ? [{ id: row.school.schoolId, name: row.school.name, type: 'School' as const }]
          : row.campus
            ? [{ id: row.campus.campusId, name: row.campus.name, type: 'Campus' as const }]
            : [];

  return {
    id: row.memoId,
    memoType: row.memoType || 'Internal Memo',
    requiresAcknowledgement: memoRequiresAcknowledgement(row.memoType || 'Internal Memo'),
    to: recipients,
    agenda: row.title,
    content: row.content,
    attachments: row.attachments ?? [],
    dateCreated: row.publishedAt.toISOString(),
    effectiveDate: row.effectiveDate.toISOString(),
    status,
    acknowledgements: row.acknowledgements?.map((ack: any) => ({
      id: ack.id,
      name: `${ack.employee.firstName} ${ack.employee.lastName}`.trim(),
      position: ack.employee.position ?? 'Unassigned',
      avatarUrl: ack.employee.profileImage ?? undefined,
      acknowledgedAt: ack.acknowledgedAt.toISOString(),
    })) ?? [],
  };
};

adminMemosRouter.post(
  '/memos/attachments',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  memoUpload.array('files', MEMO_MAX_ATTACHMENTS),
  async (req, res, next) => {
    try {
      const auth = req.auth as AdminAuth | undefined;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        throw new ApiError(400, 'No attachments uploaded');
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const attachments = files.map((file) => `${baseUrl}/uploads/memos/${file.filename}`);

      res.json({ attachments });
    } catch (error) {
      next(error);
    }
  },
);

adminMemosRouter.get(
  '/memos/list',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth as AdminAuth | undefined;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      if (auth.role === 'ROLE_CAMPUS_HR' && !auth.schoolId) {
        throw new ApiError(403, 'Campus HR account is missing school scope configuration');
      }

      const query = listMemosQuerySchema.parse(req.query);
      const searchTerm = query.search?.trim();

      const scopeFilter = getAdminMemoWhere(req.auth!);

      const searchFilter = searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' as const } },
              { content: { contains: searchTerm, mode: 'insensitive' as const } },
              { memoType: { contains: searchTerm, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const rows = await prisma.memo.findMany({
        // Both filters use OR, so they must be combined with AND rather than spread.
        where: {
          AND: [scopeFilter, searchFilter],
        },
        select: {
          ...memoSelect,
          acknowledgements: {
            ...memoSelect.acknowledgements,
            where: getAdminAcknowledgementWhere(req.auth!),
          },
        },
        orderBy: [{ publishedAt: 'desc' }],
      });

      res.json({
        memos: rows.map(normalizeMemoRow),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminMemosRouter.post(
  '/memos',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth as AdminAuth | undefined;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }

      if (auth.role === 'ROLE_CAMPUS_HR' && !auth.schoolId) {
        throw new ApiError(403, 'Campus HR account is missing school scope configuration');
      }

      const payload = createMemoBodySchema.parse(req.body);
      const createdAt = parseDate(payload.dateCreated, new Date(), 'created');
      const effectiveDate = parseDate(payload.effectiveDate, createdAt, 'effective');
      const attachments = payload.attachments ?? [];
      const recipientIds = payload.recipientIds ?? [];

      if (payload.recipientType !== 'All' && recipientIds.length === 0) {
        throw new ApiError(400, 'At least one recipient must be selected');
      }

      if (payload.recipientType === 'All') {
        if (auth.role === 'ROLE_CAMPUS_HR' && !auth.schoolId) {
          throw new ApiError(403, 'Campus HR account is missing school scope configuration');
        }

        const memo = await prisma.memo.create({
          data: {
            memoType: payload.memoType,
            title: payload.agenda,
            content: payload.content,
            attachments,
            effectiveDate,
            scopeType: 'GLOBAL',
            campusId: auth.role === 'ROLE_CAMPUS_HR' ? auth.schoolId : null,
            schoolId: null,
            departmentId: null,
            recipientEmployeeId: null,
            createdById: auth.sub,
            publishedAt: createdAt,
          },
          select: memoSelect,
        });

        res.json({
          memos: [normalizeMemoRow(memo)],
        });
        return;
      }

      if (payload.recipientType === 'Campus') {
        const campuses = await prisma.campus.findMany({
          where: { campusId: { in: recipientIds } },
          select: { campusId: true },
        });

        if (campuses.length !== recipientIds.length) {
          throw new ApiError(400, 'One or more campuses were not found');
        }

        campuses.forEach((campus) => {
          if (auth.role === 'ROLE_CAMPUS_HR' && campus.campusId !== auth.schoolId) {
            throw new ApiError(403, 'Requested school is outside your admin scope');
          }
        });

        const created = await prisma.$transaction(
          campuses.map((campus) =>
            prisma.memo.create({
              data: {
                memoType: payload.memoType,
                title: payload.agenda,
                content: payload.content,
                attachments,
                effectiveDate,
                scopeType: 'SCHOOL',
                campusId: campus.campusId,
                schoolId: null,
                departmentId: null,
                recipientEmployeeId: null,
                createdById: auth.sub,
                publishedAt: createdAt,
              },
              select: memoSelect,
            }),
          ),
        );

        res.json({
          memos: created.map(normalizeMemoRow),
        });
        return;
      }

      if (payload.recipientType === 'School') {
        const schools = await prisma.school.findMany({
          where: {
            schoolId: { in: recipientIds },
            type: 'TEACHING',
          },
          select: {
            schoolId: true,
            campusId: true,
          },
        });

        if (schools.length !== recipientIds.length) {
          throw new ApiError(400, 'One or more schools were not found');
        }

        schools.forEach((school) => {
          if (auth.role === 'ROLE_CAMPUS_HR' && school.campusId !== auth.schoolId) {
            throw new ApiError(403, 'Requested school is outside your admin scope');
          }
        });

        const created = await prisma.$transaction(
          schools.map((school) =>
            prisma.memo.create({
              data: {
                memoType: payload.memoType,
                title: payload.agenda,
                content: payload.content,
                attachments,
                effectiveDate,
                scopeType: 'SCHOOL',
                campusId: school.campusId,
                schoolId: school.schoolId,
                departmentId: null,
                recipientEmployeeId: null,
                createdById: auth.sub,
                publishedAt: createdAt,
              },
              select: memoSelect,
            }),
          ),
        );

        res.json({
          memos: created.map(normalizeMemoRow),
        });
        return;
      }

      if (payload.recipientType === 'Department') {
        const departments = await prisma.department.findMany({
          where: { departmentId: { in: recipientIds } },
          select: {
            departmentId: true,
            school: {
              select: {
                campusId: true,
                schoolId: true,
              },
            },
          },
        });

        if (departments.length !== recipientIds.length) {
          throw new ApiError(400, 'One or more departments were not found');
        }

        departments.forEach((department) => {
          if (auth.role === 'ROLE_CAMPUS_HR' && department.school.campusId !== auth.schoolId) {
            throw new ApiError(403, 'Requested department is outside your admin scope');
          }
        });

        const created = await prisma.$transaction(
          departments.map((department) =>
            prisma.memo.create({
              data: {
                memoType: payload.memoType,
                title: payload.agenda,
                content: payload.content,
                attachments,
                effectiveDate,
                scopeType: 'DEPARTMENT',
                campusId: department.school.campusId,
                schoolId: department.school.schoolId,
                departmentId: department.departmentId,
                recipientEmployeeId: null,
                createdById: auth.sub,
                publishedAt: createdAt,
              },
              select: memoSelect,
            }),
          ),
        );

        res.json({
          memos: created.map(normalizeMemoRow),
        });
        return;
      }

      const employees = await prisma.user.findMany({
        where: {
          userId: { in: recipientIds },
          role: 'ROLE_EMPLOYEE',
        },
        select: {
          userId: true,
          schoolId: true,
          departmentId: true,
          departmentModel: {
            select: {
              schoolId: true,
            },
          },
        },
      });

      if (employees.length !== recipientIds.length) {
        throw new ApiError(400, 'One or more employees were not found');
      }

      employees.forEach((employee) => {
        if (!employee.schoolId) {
          throw new ApiError(400, 'Selected employee is missing school assignment');
        }
        if (auth.role === 'ROLE_CAMPUS_HR' && employee.schoolId !== auth.schoolId) {
          throw new ApiError(403, 'Requested employee is outside your admin scope');
        }
      });

      const created = await prisma.$transaction(
        employees.map((employee) =>
          prisma.memo.create({
            data: {
              memoType: payload.memoType,
              title: payload.agenda,
              content: payload.content,
              attachments,
              effectiveDate,
              scopeType: employee.departmentId ? 'DEPARTMENT' : 'SCHOOL',
              campusId: employee.schoolId,
              schoolId: employee.departmentModel?.schoolId ?? null,
              departmentId: employee.departmentId,
              recipientEmployeeId: employee.userId,
              createdById: auth.sub,
              publishedAt: createdAt,
            },
            select: memoSelect,
          }),
        ),
      );

      res.json({
        memos: created.map(normalizeMemoRow),
      });
    } catch (error) {
      next(error);
    }
  },
);
