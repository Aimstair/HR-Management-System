import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { ATTENDANCE_APPEAL_KIND, type AttendanceAppealDetails } from '../lib/attendance-appeals.js';
import { getEmployeeMemoWhere } from '../lib/memo-visibility.js';
import { applyEmployeeRequestRules, RETIRED_REQUEST_TYPES } from '../lib/request-rules.js';
import { memoRequiresAcknowledgement } from '../lib/memo-rules.js';

export const employeeRouter = Router();

// Allow authenticated users to access this
employeeRouter.use(requireAuth);

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

const createRequestSchema = z.object({
  type: requestTypeSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  remarks: z.string().trim().max(2000).optional().nullable(),
  leaveStartDate: z.string().trim().optional().nullable(),
  leaveEndDate: z.string().trim().optional().nullable(),
});

// Get employee dashboard summary
employeeRouter.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;

    const memoWhere = await getEmployeeMemoWhere(userId);

    const [attendanceCount, requestCount, recentMemos] = await Promise.all([
      prisma.nonTeachingAttendance.count({
        where: { employeeId: userId },
      }),
      prisma.requestRecord.count({
        where: { employeeId: userId, status: 'PENDING', type: { notIn: RETIRED_REQUEST_TYPES } },
      }),
      prisma.memo.findMany({
        where: memoWhere,
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: {
          memoId: true,
          title: true,
          publishedAt: true,
          effectiveDate: true,
        },
      }),
    ]);

    res.json({
      summary: {
        totalAttendanceEntries: attendanceCount,
        pendingRequests: requestCount,
      },
      recentMemos,
    });
  } catch (error) {
    next(error);
  }
});

// List employee requests
employeeRouter.get('/requests', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;

    const requests = await prisma.requestRecord.findMany({
      where: { employeeId: userId, type: { notIn: RETIRED_REQUEST_TYPES } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
});

// Create employee request
employeeRouter.post('/requests', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;
    const body = createRequestSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { userId },
      select: { schoolId: true, departmentId: true, employeeType: true }
    });

    if (!user || !user.schoolId) {
      throw new ApiError(400, 'User is not assigned to a campus');
    }

    const schedule = applyEmployeeRequestRules({
      type: body.type,
      employeeType: user.employeeType,
      description: body.description,
      leaveStartDate: body.leaveStartDate ? new Date(body.leaveStartDate) : null,
      leaveEndDate: body.leaveEndDate ? new Date(body.leaveEndDate) : null,
    });

    const requestRecord = await prisma.requestRecord.create({
      data: {
        type: body.type,
        status: 'PENDING',
        title: body.title,
        description: body.description,
        remarks: body.remarks,
        leaveStartDate: schedule.leaveStartDate,
        leaveEndDate: schedule.leaveEndDate,
        employeeId: userId,
        campusId: user.schoolId,
        departmentId: user.departmentId,
      },
    });

    res.status(201).json(requestRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, 'Validation Error: ' + error.errors.map(e => e.message).join(', ')));
      return;
    }
    next(error);
  }
});

// List employee attendance
employeeRouter.get('/attendance', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;

    const nonTeachingAttendance = await prisma.nonTeachingAttendance.findMany({
      where: { employeeId: userId },
      orderBy: { attendanceDate: 'desc' },
      take: 50,
    });
    
    const teachingAttendance = await prisma.teachingAttendance.findMany({
      where: { employeeId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        classSession: {
          include: {
            subject: true
          }
        }
      }
    });

    res.json({ 
      data: {
        nonTeachingAttendance,
        teachingAttendance
      }
    });
  } catch (error) {
    next(error);
  }
});

const attendanceAppealSchema = z.object({
  mode: z.enum(['DAILY', 'TEACHING_SESSION']),
  reason: z.string().trim().min(1).max(1000),
  requestedTimeIn: z.string().trim().optional().nullable(),
  requestedTimeOut: z.string().trim().optional().nullable(),
});

const parseOptionalIso = (value: string | null | undefined, field: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid ${field} value`);
  }

  return parsed;
};

// File an appeal on a late/absent attendance record. It lands in the HR request
// queue for the employee's campus; approval marks the record as PRESENT.
employeeRouter.post('/attendance/:attendanceId/appeal', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { attendanceId } = req.params;
    const body = attendanceAppealSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { userId },
      select: { schoolId: true, departmentId: true },
    });

    if (!user || !user.schoolId) {
      throw new ApiError(400, 'User is not assigned to a campus');
    }

    let details: AttendanceAppealDetails;
    let campusId = user.schoolId;
    let scheduleStart: Date | null = null;
    let scheduleEnd: Date | null = null;

    if (body.mode === 'TEACHING_SESSION') {
      const attendance = await prisma.teachingAttendance.findFirst({
        where: { attendanceId, employeeId: userId },
        include: { classSession: { include: { subject: true } } },
      });

      if (!attendance) {
        throw new ApiError(404, 'Attendance record not found');
      }

      if (attendance.status !== 'LATE' && attendance.status !== 'ABSENT') {
        throw new ApiError(400, 'Appeals are available only for Late or Absent session marks');
      }

      const session = attendance.classSession;
      scheduleStart = session.startsAt;
      scheduleEnd = session.endsAt;
      details = {
        kind: ATTENDANCE_APPEAL_KIND,
        attendanceId,
        mode: 'TEACHING_SESSION',
        date: session.sessionDate.toISOString().split('T')[0],
        markedStatus: attendance.status,
        subject: [session.subject?.code, session.subject?.name].filter(Boolean).join(' - ') || null,
        previousTimeIn: session.startsAt.toISOString(),
        previousTimeOut: session.endsAt.toISOString(),
        reason: body.reason,
      };
    } else {
      const attendance = await prisma.nonTeachingAttendance.findFirst({
        where: { attendanceId, employeeId: userId },
      });

      if (!attendance) {
        throw new ApiError(404, 'Attendance record not found');
      }

      const requestedTimeIn = parseOptionalIso(body.requestedTimeIn, 'requestedTimeIn');
      const requestedTimeOut = parseOptionalIso(body.requestedTimeOut, 'requestedTimeOut');
      if (requestedTimeIn && requestedTimeOut && requestedTimeOut <= requestedTimeIn) {
        throw new ApiError(400, 'Time out must be after time in');
      }

      campusId = attendance.schoolId;
      scheduleStart = requestedTimeIn;
      scheduleEnd = requestedTimeOut;
      details = {
        kind: ATTENDANCE_APPEAL_KIND,
        attendanceId,
        mode: 'DAILY',
        date: attendance.attendanceDate.toISOString().split('T')[0],
        markedStatus: attendance.status,
        previousTimeIn: attendance.checkInTime?.toISOString() ?? null,
        previousTimeOut: attendance.checkOutTime?.toISOString() ?? null,
        requestedTimeIn: requestedTimeIn?.toISOString() ?? null,
        requestedTimeOut: requestedTimeOut?.toISOString() ?? null,
        reason: body.reason,
      };
    }

    const pendingAppeal = await prisma.requestRecord.findFirst({
      where: {
        employeeId: userId,
        type: 'TIME_ADJUSTMENT',
        status: 'PENDING',
        description: { contains: `"attendanceId":"${attendanceId}"` },
      },
      select: { requestId: true },
    });

    if (pendingAppeal) {
      throw new ApiError(409, 'An appeal for this attendance record is already pending review');
    }

    const requestRecord = await prisma.requestRecord.create({
      data: {
        type: 'TIME_ADJUSTMENT',
        status: 'PENDING',
        title: `Attendance Appeal - ${details.date}${details.subject ? ` - ${details.subject}` : ''} - ${Date.now()}`,
        description: JSON.stringify(details),
        leaveStartDate: scheduleStart,
        leaveEndDate: scheduleEnd,
        employeeId: userId,
        campusId,
        departmentId: user.departmentId,
      },
    });

    res.status(201).json(requestRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, 'Validation Error: ' + error.errors.map(e => e.message).join(', ')));
      return;
    }
    next(error);
  }
});

// List employee memos
employeeRouter.get('/memos', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;

    const memos = await prisma.memo.findMany({
      where: await getEmployeeMemoWhere(userId),
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: {
        acknowledgements: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                position: true,
                profileImage: true,
              }
            }
          }
        }
      }
    });

    res.json({
      data: memos.map((memo) => ({
        ...memo,
        requiresAcknowledgement: memoRequiresAcknowledgement(memo.memoType),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Acknowledge a memo
employeeRouter.post('/memos/:memoId/acknowledge', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { memoId } = req.params;

    const visibleMemo = await prisma.memo.findFirst({
      where: { AND: [{ memoId }, await getEmployeeMemoWhere(userId)] },
      select: { memoId: true, memoType: true },
    });

    if (!visibleMemo) {
      throw new ApiError(404, 'Memo not found');
    }

    if (!memoRequiresAcknowledgement(visibleMemo.memoType)) {
      throw new ApiError(400, 'This memo is informational and does not need acknowledgement');
    }

    const existing = await prisma.memoAcknowledgement.findUnique({
      where: {
        memoId_employeeId: {
          memoId,
          employeeId: userId,
        }
      }
    });

    if (existing) {
      res.json({ success: true, message: 'Already acknowledged' });
      return;
    }

    await prisma.memoAcknowledgement.create({
      data: {
        memoId,
        employeeId: userId,
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// List employee evaluations
employeeRouter.get('/evaluations', async (req, res, next) => {
  try {
    const userId = req.auth!.sub;

    const evaluations = await prisma.performanceEvaluation.findMany({
      where: { employeeId: userId },
      orderBy: { periodStart: 'desc' },
    });

    const formattedData = evaluations.map((ev) => {
      const criteria = ev.criteria as any;
      let performanceLevel = 'satisfactory';
      if (ev.overallScore >= 4.5) performanceLevel = 'excellent';
      else if (ev.overallScore >= 4.0) performanceLevel = 'good';
      else if (ev.overallScore < 3.0) performanceLevel = 'needs-improvement';

      return {
        id: ev.evaluationId,
        areaCode: criteria?.subjectCode || 'N/A',
        areaName: criteria?.subjectTitle || 'Performance Review',
        participantCount: criteria?.respondentCount || 0,
        avgRating: ev.overallScore,
        performanceLevel,
      };
    });

    res.json({ data: formattedData });
  } catch (error) {
    next(error);
  }
});
