import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { getScopedRequestWhere, getScopedShiftWhere, getScopedUserWhere } from '../lib/scope-filters.js';
import type { AppRole } from '../types/auth.js';

export const adminDashboardRouter = Router();

const ADMIN_ROLES: AppRole[] = [
  'ROLE_HEAD_HR',
  'ROLE_CAMPUS_HR',
];

type DashboardRequestTypeLabel = 'Leave' | 'Undertime' | 'Overtime' | 'Work from Home' | 'Time Adjustment';

const PRIORITY_REQUEST_TYPES = ['LEAVE', 'UNDERTIME', 'OVERTIME', 'WFH', 'TIME_ADJUSTMENT'] as const;

const REQUEST_TYPE_LABELS: Record<(typeof PRIORITY_REQUEST_TYPES)[number], DashboardRequestTypeLabel> = {
  LEAVE: 'Leave',
  UNDERTIME: 'Undertime',
  OVERTIME: 'Overtime',
  WFH: 'Work from Home',
  TIME_ADJUSTMENT: 'Time Adjustment',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const startOfUtcDay = (value: Date): Date => {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
};

const endOfUtcDay = (value: Date): Date => {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999));
};

const toDateKey = (value: Date): string => value.toISOString().slice(0, 10);

const buildAttendanceBuckets = (startDate: Date, days: number) => {
  const buckets = new Map<
    string,
    { day: string; date: string; present: number; absent: number; late: number }
  >();

  for (let i = 0; i < days; i += 1) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + i);
    const key = toDateKey(date);
    buckets.set(key, {
      day: DAY_LABELS[date.getUTCDay()],
      date: key,
      present: 0,
      absent: 0,
      late: 0,
    });
  }

  return buckets;
};

const incrementNonTeachingBucket = (bucket: { present: number; absent: number; late: number }, status: string) => {
  if (status === 'ABSENT' || status === 'LEAVE') {
    bucket.absent += 1;
    return;
  }

  if (status === 'LATE') {
    bucket.late += 1;
  }

  bucket.present += 1;
};

adminDashboardRouter.get(
  '/dashboard/summary',
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        throw new ApiError(401, 'Authentication is required');
      }
      const now = new Date();
      const todayStart = startOfUtcDay(now);
      const todayEnd = endOfUtcDay(now);
      const rangeStart = new Date(todayStart);
      rangeStart.setUTCDate(rangeStart.getUTCDate() - 6);

      const scopedRequestWhere = getScopedRequestWhere(auth);
      const scopedShiftWhere = getScopedShiftWhere(auth);
      const scopedUserWhere = getScopedUserWhere(auth, 'ROLE_EMPLOYEE');
      const campusScope = auth.role === 'ROLE_CAMPUS_HR' ? auth.schoolId ?? undefined : undefined;

      const [
        totalTeachingEmployees,
        totalNonTeachingEmployees,
        pendingRequests,
        activeShifts,
        recentMemos,
        leaveEmployees,
        pendingByType,
        priorityRequests,
        teachingAttendance,
        nonTeachingAttendance,
        lateTeaching,
        lateNonTeaching,
      ] = await Promise.all([
        prisma.user.count({
          where: {
            ...scopedUserWhere,
            isActive: true,
            employeeType: 'TEACHING',
          },
        }),
        prisma.user.count({
          where: {
            ...scopedUserWhere,
            isActive: true,
            employeeType: 'NON_TEACHING',
          },
        }),
        prisma.requestRecord.count({
          where: {
            ...scopedRequestWhere,
            status: 'PENDING',
          },
        }),
        prisma.shift.count({
          where: scopedShiftWhere,
        }),
        prisma.memo.findMany({
          where: auth.role === 'ROLE_HEAD_HR' ? {} : { campusId: auth.schoolId ?? undefined },
          select: {
            memoId: true,
            title: true,
            publishedAt: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: 5,
        }),
        prisma.requestRecord.findMany({
          where: {
            ...scopedRequestWhere,
            status: 'APPROVED',
            type: 'LEAVE',
            AND: [
              { leaveStartDate: { not: null } },
              { leaveEndDate: { not: null } },
              { leaveStartDate: { lte: todayEnd } },
              { leaveEndDate: { gte: todayStart } },
            ],
          },
          select: {
            employeeId: true,
          },
          distinct: ['employeeId'],
        }),
        prisma.requestRecord.groupBy({
          by: ['type'],
          where: {
            ...scopedRequestWhere,
            status: 'PENDING',
            type: { in: PRIORITY_REQUEST_TYPES as unknown as string[] },
          },
          _count: {
            _all: true,
          },
        }),
        prisma.requestRecord.findMany({
          where: {
            ...scopedRequestWhere,
            status: 'PENDING',
            type: { in: PRIORITY_REQUEST_TYPES as unknown as string[] },
          },
          select: {
            requestId: true,
            type: true,
            createdAt: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 4,
        }),
        prisma.teachingAttendance.findMany({
          where: {
            classSession: {
              sessionDate: {
                gte: rangeStart,
                lte: todayEnd,
              },
              ...(campusScope ? { school: { campusId: campusScope } } : {}),
            },
          },
          select: {
            employeeId: true,
            status: true,
            classSession: {
              select: {
                sessionDate: true,
              },
            },
          },
        }),
        prisma.nonTeachingAttendance.findMany({
          where: {
            attendanceDate: {
              gte: rangeStart,
              lte: todayEnd,
            },
            ...(campusScope ? { schoolId: campusScope } : {}),
          },
          select: {
            status: true,
            attendanceDate: true,
          },
        }),
        prisma.teachingAttendance.findMany({
          where: {
            status: 'LATE',
            classSession: {
              sessionDate: {
                gte: todayStart,
                lte: todayEnd,
              },
              ...(campusScope ? { school: { campusId: campusScope } } : {}),
            },
          },
          select: {
            attendanceId: true,
            minutesLate: true,
            employee: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                department: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            minutesLate: 'desc',
          },
          take: 10,
        }),
        prisma.nonTeachingAttendance.findMany({
          where: {
            status: 'LATE',
            attendanceDate: {
              gte: todayStart,
              lte: todayEnd,
            },
            ...(campusScope ? { schoolId: campusScope } : {}),
          },
          select: {
            attendanceId: true,
            minutesLate: true,
            employee: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                department: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            minutesLate: 'desc',
          },
          take: 10,
        }),
      ]);

      const totalEmployees = totalTeachingEmployees + totalNonTeachingEmployees;
      const employeeBuckets = buildAttendanceBuckets(rangeStart, 7);
      const teachingEmployeeBuckets = buildAttendanceBuckets(rangeStart, 7);
      const nonTeachingBuckets = buildAttendanceBuckets(rangeStart, 7);
      const teachingSessionBuckets = buildAttendanceBuckets(rangeStart, 7);
      const teachingDaily = new Map<string, Map<string, { hasPresent: boolean; hasLate: boolean }>>();

      teachingAttendance.forEach((row) => {
        const key = toDateKey(row.classSession.sessionDate);
        const daily = teachingDaily.get(key) ?? new Map<string, { hasPresent: boolean; hasLate: boolean }>();
        const status = daily.get(row.employeeId) ?? { hasPresent: false, hasLate: false };
        if (row.status !== 'ABSENT') {
          status.hasPresent = true;
          if (row.status === 'LATE') {
            status.hasLate = true;
          }
        }
        daily.set(row.employeeId, status);
        teachingDaily.set(key, daily);
      });

      teachingDaily.forEach((daily, key) => {
        const bucket = employeeBuckets.get(key);
        const teachingBucket = teachingEmployeeBuckets.get(key);
        if (!bucket || !teachingBucket) {
          return;
        }

        daily.forEach((status) => {
          if (status.hasPresent) {
            bucket.present += 1;
            teachingBucket.present += 1;
            if (status.hasLate) {
              bucket.late += 1;
              teachingBucket.late += 1;
            }
          } else {
            bucket.absent += 1;
            teachingBucket.absent += 1;
          }
        });
      });

      teachingAttendance.forEach((row) => {
        const key = toDateKey(row.classSession.sessionDate);
        const teachingBucket = teachingSessionBuckets.get(key);
        if (!teachingBucket) {
          return;
        }

        if (row.status === 'ABSENT' || row.status === 'EXCUSED') {
          teachingBucket.absent += 1;
          return;
        }

        if (row.status === 'LATE') {
          teachingBucket.late += 1;
        }

        teachingBucket.present += 1;
      });

      nonTeachingAttendance.forEach((row) => {
        const key = toDateKey(row.attendanceDate);
        const bucket = employeeBuckets.get(key);
        const nonTeachingBucket = nonTeachingBuckets.get(key);
        if (!bucket || !nonTeachingBucket) {
          return;
        }
        incrementNonTeachingBucket(bucket, row.status);
        incrementNonTeachingBucket(nonTeachingBucket, row.status);
      });

      const todayKey = toDateKey(todayStart);
      const todayBucket = employeeBuckets.get(todayKey) ?? { present: 0, absent: 0, late: 0 };
      const todayTotal = todayBucket.present + todayBucket.absent;
      const todayAttendance = todayTotal === 0 ? 0 : Math.round((todayBucket.present / todayTotal) * 100);

      const todayTeachingBucket = teachingEmployeeBuckets.get(todayKey) ?? { present: 0, absent: 0, late: 0 };
      const todayNonTeachingBucket = nonTeachingBuckets.get(todayKey) ?? { present: 0, absent: 0, late: 0 };
      const todayTeachingSessionBucket = teachingSessionBuckets.get(todayKey) ?? { present: 0, absent: 0, late: 0 };
      const teachingActive = todayTeachingBucket.present + todayTeachingBucket.absent;
      const nonTeachingTotal = todayNonTeachingBucket.present + todayNonTeachingBucket.absent;
      const nonTeachingActive = todayNonTeachingBucket.present;
      const todayTeachingAttendance =
        teachingActive === 0 ? 0 : Math.round((todayTeachingBucket.present / teachingActive) * 100);
      const todayNonTeachingAttendance =
        nonTeachingTotal === 0 ? 0 : Math.round((todayNonTeachingBucket.present / nonTeachingTotal) * 100);
      const teachingSessionsPresent = todayTeachingSessionBucket.present;
      const teachingSessionsTotal = todayTeachingSessionBucket.present + todayTeachingSessionBucket.absent;
      const todayTeachingSessionsAttendance =
        teachingSessionsTotal === 0
          ? 0
          : Math.round((teachingSessionsPresent / teachingSessionsTotal) * 100);

      const leaveCount = leaveEmployees.length;

      const pendingMap = new Map<string, number>();
      pendingByType.forEach((row) => {
        pendingMap.set(row.type, row._count._all);
      });

      const requestBreakdown = PRIORITY_REQUEST_TYPES.map((type) => ({
        name: REQUEST_TYPE_LABELS[type],
        value: pendingMap.get(type) ?? 0,
      }));

      const priorityRequestItems = priorityRequests.map((row) => ({
        id: row.requestId,
        avatarUrl: row.employee.profileImage,
        name: `${row.employee.firstName} ${row.employee.lastName}`,
        requestType: REQUEST_TYPE_LABELS[row.type as (typeof PRIORITY_REQUEST_TYPES)[number]],
        dateSubmitted: row.createdAt.toISOString(),
      }));

      const tardinessWatchlist = [...lateTeaching, ...lateNonTeaching]
        .map((row) => ({
          id: row.attendanceId,
          employeeId: row.employee.userId,
          avatarUrl: row.employee.profileImage,
          name: `${row.employee.firstName} ${row.employee.lastName}`,
          department: row.employee.department,
          minutesLate: row.minutesLate ?? 0,
        }))
        .sort((a, b) => b.minutesLate - a.minutesLate)
        .slice(0, 4);

      res.json({
        summary: {
          totalEmployees,
          totalTeachingEmployees,
          totalNonTeachingEmployees,
          teachingActive,
          nonTeachingActive,
          teachingSessionsPresent,
          teachingSessionsTotal,
          todayTeachingSessionsAttendance,
          onLeave: leaveCount,
          pendingRequests,
          todayAttendance,
          todayTeachingAttendance,
          todayNonTeachingAttendance,
          totalLate: lateTeaching.length + lateNonTeaching.length,
          activeShifts,
        },
        attendanceTrendNonTeaching: Array.from(nonTeachingBuckets.values()),
        attendanceTrendTeaching: Array.from(teachingSessionBuckets.values()),
        requestBreakdown,
        priorityRequests: priorityRequestItems,
        tardinessWatchlist,
        recentMemos: recentMemos.map((memo: { memoId: string; title: string; publishedAt: Date }) => ({
          id: memo.memoId,
          title: memo.title,
          publishedAt: memo.publishedAt.toISOString(),
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);
