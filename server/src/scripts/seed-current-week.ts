/**
 * Adds attendance and request data for the current week (Monday to today) without
 * touching existing rows. Safe to re-run: every row has a deterministic id and is
 * inserted with skipDuplicates.
 *
 *   npm run seed:week
 */
import 'dotenv/config';
import type { RequestStatus, RequestType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  ATTENDANCE_APPEAL_KIND,
  applyApprovedAttendanceAppeals,
  type AttendanceAppealDetails,
} from '../lib/attendance-appeals.js';

const REQUESTS_PER_TYPE_PER_CAMPUS = 12;
const REQUEST_TYPES: RequestType[] = ['LEAVE', 'OVERTIME', 'UNDERTIME', 'TIME_ADJUSTMENT'];
// Teaching faculty cannot file overtime or undertime.
const NON_TEACHING_ONLY_TYPES = new Set<RequestType>(['OVERTIME', 'UNDERTIME']);

// Deterministic PRNG so re-runs produce the same rows (and skipDuplicates dedupes them).
const createRandom = (seed: number) => {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pad = (value: number): string => String(value).padStart(2, '0');
const toDateKey = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

/** Attendance dates are stored as UTC midnight of the local calendar date. */
const utcDateOf = (local: Date): Date =>
  new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));

/** A real instant for a local wall-clock time on the given (UTC-midnight) date. */
const localTime = (date: Date, hours: number, minutes = 0): Date =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes);

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * 86_400_000);

const pick = <T>(items: T[], random: () => number): T => items[Math.floor(random() * items.length)];

const run = async (): Promise<void> => {
  const now = new Date();
  const today = utcDateOf(now);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const weekStart = addDays(today, -mondayOffset);
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const workDatesSoFar = weekDates.filter(
    (date) => date.getTime() <= today.getTime() && date.getUTCDay() !== 0 && date.getUTCDay() !== 6,
  );
  const weekKey = toDateKey(weekStart).replace(/-/g, '');
  const prefix = `WEEK${weekKey}`;
  const random = createRandom(Number(weekKey));

  console.log(`Seeding week of ${toDateKey(weekStart)}; attendance for ${workDatesSoFar.map(toDateKey).join(', ') || 'none'}`);

  const campuses = await prisma.campus.findMany({ select: { campusId: true, name: true, code: true } });
  const hrUsers = await prisma.user.findMany({
    where: { role: { in: ['ROLE_CAMPUS_HR', 'ROLE_HEAD_HR'] } },
    select: { userId: true, role: true, adminSchoolId: true },
  });
  const headHr = hrUsers.find((user) => user.role === 'ROLE_HEAD_HR') ?? null;

  // ---------------------------------------------------------------- Non-teaching attendance
  let dailyCount = 0;
  for (const campus of campuses) {
    const staff = await prisma.user.findMany({
      where: { role: 'ROLE_EMPLOYEE', isActive: true, employeeType: 'NON_TEACHING', schoolId: campus.campusId },
      select: { userId: true, departmentId: true },
      orderBy: { userId: 'asc' },
    });

    const rows = workDatesSoFar.flatMap((date) =>
      staff.map((employee) => {
        const roll = random();
        const status = roll < 0.07 ? 'ABSENT' : roll < 0.17 ? 'LATE' : 'PRESENT';
        const minutesLate = status === 'LATE' ? 5 + Math.floor(random() * 40) : null;
        const isToday = date.getTime() === today.getTime();

        return {
          attendanceId: `${prefix}-NT-${employee.userId}-${toDateKey(date)}`,
          employeeId: employee.userId,
          schoolId: campus.campusId,
          departmentId: employee.departmentId,
          attendanceDate: date,
          status: status as 'ABSENT' | 'LATE' | 'PRESENT',
          checkInTime:
            status === 'ABSENT'
              ? null
              : localTime(date, 8, status === 'LATE' ? minutesLate! : Math.floor(random() * 10)),
          // Today's shift is still in progress unless it's already past 5 PM.
          checkOutTime:
            status === 'ABSENT' || (isToday && now.getHours() < 17)
              ? null
              : localTime(date, 17, Math.floor(random() * 20)),
          remarks: status === 'ABSENT' ? 'Absent' : status === 'LATE' ? 'Delayed arrival' : null,
          minutesLate,
        };
      }),
    );

    const result = await prisma.nonTeachingAttendance.createMany({ data: rows, skipDuplicates: true });
    dailyCount += result.count;
  }
  console.log(`Non-teaching attendance rows added: ${dailyCount}`);

  // ---------------------------------------------------------------- Teaching sessions + attendance
  // Reuse each teacher's latest weekly timetable so this week lines up with earlier weeks.
  // Sessions this script generated are skipped, otherwise a re-run would clone its own output.
  const notGeneratedByThisScript = { NOT: { classSessionId: { startsWith: 'WEEK' } } };
  const latestSession = await prisma.classSession.findFirst({
    where: notGeneratedByThisScript,
    orderBy: { sessionDate: 'desc' },
    select: { sessionDate: true },
  });

  let sessionCount = 0;
  let teachingCount = 0;
  if (latestSession) {
    const templateStart = addDays(latestSession.sessionDate, -6);
    const templates = await prisma.classSession.findMany({
      where: { ...notGeneratedByThisScript, sessionDate: { gte: templateStart, lte: latestSession.sessionDate } },
      include: { attendance: { select: { employeeId: true } } },
    });

    const sessions: Array<{
      classSessionId: string;
      subjectId: string;
      schoolId: string;
      departmentId: string | null;
      sessionDate: Date;
      startsAt: Date;
      endsAt: Date;
      room: string | null;
    }> = [];
    const attendance: Array<{
      attendanceId: string;
      employeeId: string;
      classSessionId: string;
      status: 'PRESENT' | 'LATE' | 'ABSENT';
      remarks: string | null;
      minutesLate: number | null;
    }> = [];

    for (const date of workDatesSoFar) {
      templates
        .filter((template) => template.sessionDate.getUTCDay() === date.getUTCDay())
        .forEach((template) => {
          const classSessionId = `${prefix}-CS-${template.classSessionId}-${toDateKey(date)}`;
          const startOffset = template.startsAt.getTime() - template.sessionDate.getTime();
          const endOffset = template.endsAt.getTime() - template.sessionDate.getTime();

          sessions.push({
            classSessionId,
            subjectId: template.subjectId,
            schoolId: template.schoolId,
            departmentId: template.departmentId,
            sessionDate: date,
            startsAt: new Date(date.getTime() + startOffset),
            endsAt: new Date(date.getTime() + endOffset),
            room: template.room,
          });

          template.attendance.forEach(({ employeeId }) => {
            const roll = random();
            const status = roll < 0.08 ? 'ABSENT' : roll < 0.2 ? 'LATE' : 'PRESENT';
            attendance.push({
              attendanceId: `${prefix}-TA-${employeeId}-${classSessionId}`.slice(0, 190),
              employeeId,
              classSessionId,
              status,
              remarks: status === 'ABSENT' ? 'Absent' : status === 'LATE' ? 'Late arrival' : 'On time',
              minutesLate: status === 'LATE' ? 5 + Math.floor(random() * 20) : null,
            });
          });
        });
    }

    sessionCount = (await prisma.classSession.createMany({ data: sessions, skipDuplicates: true })).count;
    teachingCount = (await prisma.teachingAttendance.createMany({ data: attendance, skipDuplicates: true })).count;
  }
  console.log(`Class sessions added: ${sessionCount}; teaching attendance rows added: ${teachingCount}`);

  // ---------------------------------------------------------------- Requests
  const leaveTypes = ['Vacation Leave', 'Sick Leave', 'Emergency Leave'];
  const leaveCoverages = ['Whole Day', 'Half Day (AM)', 'Half Day (PM)'];
  const reasons: Record<RequestType, string[]> = {
    LEAVE: ['Family matter to attend to', 'Medical check-up', 'Feeling unwell', 'Personal errand out of town'],
    OVERTIME: ['Grade encoding deadline', 'Enrollment support', 'Inventory reconciliation', 'Event preparation'],
    UNDERTIME: ['Medical appointment', 'Child pick-up from school', 'Government office transaction'],
    WFH: [],
    TIME_ADJUSTMENT: [
      'Biometric scanner did not register my time in',
      'Heavy traffic due to road repairs, arrived as class started',
      'Attended a campus meeting called by the dean',
      'Was proctoring an exam in another room',
    ],
    EXPENSE: [],
    FUND: [],
    SHIFT_ASSIGNMENT: [],
    SWAP_REQUEST: [],
  };

  const reviewRemarks: Partial<Record<RequestStatus, string[]>> = {
    APPROVED: ['Approved.', 'Approved. Noted by HR.', 'Approved, supporting documents verified.'],
    REJECTED: ['Declined, insufficient supporting documents.', 'Declined due to staffing requirements.'],
    CANCELLED: ['Cancelled by employee.'],
  };

  const pickStatus = (): RequestStatus => {
    const roll = random();
    return roll < 0.5 ? 'PENDING' : roll < 0.8 ? 'APPROVED' : roll < 0.95 ? 'REJECTED' : 'CANCELLED';
  };

  // Filing time: a working-hours instant between Monday and now.
  const pickFiledAt = (): Date => {
    const candidates = workDatesSoFar.length > 0 ? workDatesSoFar : [today];
    const date = pick(candidates, random);
    const filed = localTime(date, 8 + Math.floor(random() * 9), Math.floor(random() * 60));
    return filed.getTime() > now.getTime() ? new Date(now.getTime() - Math.floor(random() * 3_600_000)) : filed;
  };

  const requestRows: Array<{
    requestId: string;
    type: RequestType;
    status: RequestStatus;
    title: string;
    description: string;
    remarks: string | null;
    leaveStartDate: Date | null;
    leaveEndDate: Date | null;
    employeeId: string;
    reviewedById: string | null;
    campusId: string;
    departmentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  for (const campus of campuses) {
    const campusHr = hrUsers.find((user) => user.role === 'ROLE_CAMPUS_HR' && user.adminSchoolId === campus.campusId);
    const employees = await prisma.user.findMany({
      where: { role: 'ROLE_EMPLOYEE', isActive: true, schoolId: campus.campusId },
      select: { userId: true, departmentId: true, employeeType: true },
      orderBy: { userId: 'asc' },
    });
    if (employees.length === 0) {
      continue;
    }

    // Late/absent records from this week, for attendance appeals.
    const [dailyIssues, teachingIssues] = await Promise.all([
      prisma.nonTeachingAttendance.findMany({
        where: { schoolId: campus.campusId, attendanceDate: { gte: weekStart }, status: { in: ['LATE', 'ABSENT'] } },
        select: {
          attendanceId: true, employeeId: true, departmentId: true, attendanceDate: true,
          status: true, checkInTime: true, checkOutTime: true,
        },
        orderBy: { attendanceId: 'asc' },
      }),
      prisma.teachingAttendance.findMany({
        where: {
          status: { in: ['LATE', 'ABSENT'] },
          classSession: { sessionDate: { gte: weekStart } },
          employee: { schoolId: campus.campusId },
        },
        select: {
          attendanceId: true, employeeId: true, status: true,
          employee: { select: { departmentId: true } },
          classSession: { select: { sessionDate: true, startsAt: true, endsAt: true, subject: true } },
        },
        orderBy: { attendanceId: 'asc' },
      }),
    ]);

    for (const type of REQUEST_TYPES) {
      for (let index = 0; index < REQUESTS_PER_TYPE_PER_CAMPUS; index += 1) {
        const requestId = `${prefix}-REQ-${campus.campusId}-${type}-${pad(index + 1)}`;
        const status = pickStatus();
        const filedAt = pickFiledAt();
        const reviewer = status === 'PENDING' || status === 'CANCELLED'
          ? null
          : random() < 0.85 ? campusHr ?? headHr : headHr;
        const reason = pick(reasons[type], random);
        // Only overtime may fall on a weekend; leave and undertime are weekday-only.
        const scheduleDay = pick(
          weekDates.filter((date) => (type === 'OVERTIME' ? date.getUTCDay() !== 0 : date.getUTCDay() % 6 !== 0)),
          random,
        );

        const eligibleEmployees = NON_TEACHING_ONLY_TYPES.has(type)
          ? employees.filter((candidate) => candidate.employeeType === 'NON_TEACHING')
          : employees;
        let employee: { userId: string; departmentId: string | null } = pick(eligibleEmployees, random);
        let description: Record<string, unknown>;
        let leaveStartDate: Date | null;
        let leaveEndDate: Date | null;

        if (type === 'LEAVE') {
          const coverage = pick(leaveCoverages, random);
          const wantsTwoDays = coverage === 'Whole Day' && random() < 0.5;
          const days = wantsTwoDays && addDays(scheduleDay, 1).getUTCDay() % 6 !== 0 ? 2 : 1;
          leaveStartDate = scheduleDay;
          leaveEndDate = addDays(scheduleDay, days - 1);
          description = {
            leaveType: pick(leaveTypes, random),
            leaveCoverage: coverage,
            startDate: toDateKey(leaveStartDate),
            endDate: toDateKey(leaveEndDate),
            reliever: '',
            reason,
          };
        } else if (type === 'OVERTIME') {
          leaveStartDate = localTime(scheduleDay, 17);
          leaveEndDate = localTime(scheduleDay, 19 + Math.floor(random() * 2));
          description = {
            startDateTime: leaveStartDate.toISOString(),
            endDateTime: leaveEndDate.toISOString(),
            projectTaskDone: reason,
            notes: 'Rendered after regular hours',
          };
        } else if (type === 'UNDERTIME') {
          const hour = 14 + Math.floor(random() * 3);
          leaveStartDate = localTime(scheduleDay, hour);
          leaveEndDate = leaveStartDate;
          description = { undertimeDate: toDateKey(scheduleDay), specifiedTimeOut: `${pad(hour)}:00`, reason };
        } else {
          // Attendance appeal against a real late/absent record from this week.
          const useTeaching = teachingIssues.length > 0 && (dailyIssues.length === 0 || index % 2 === 0);
          const pool = useTeaching ? teachingIssues : dailyIssues;
          const issue = pool.splice(Math.floor(random() * pool.length), 1)[0];
          if (!issue) {
            continue;
          }

          let appeal: AttendanceAppealDetails;
          if ('classSession' in issue) {
            const session = issue.classSession;
            employee = { userId: issue.employeeId, departmentId: issue.employee.departmentId };
            leaveStartDate = session.startsAt;
            leaveEndDate = session.endsAt;
            appeal = {
              kind: ATTENDANCE_APPEAL_KIND,
              attendanceId: issue.attendanceId,
              mode: 'TEACHING_SESSION',
              date: toDateKey(session.sessionDate),
              markedStatus: issue.status,
              subject: [session.subject.code, session.subject.name].filter(Boolean).join(' - '),
              previousTimeIn: session.startsAt.toISOString(),
              previousTimeOut: session.endsAt.toISOString(),
              reason,
            };
          } else {
            employee = { userId: issue.employeeId, departmentId: issue.departmentId };
            leaveStartDate = localTime(issue.attendanceDate, 8);
            leaveEndDate = localTime(issue.attendanceDate, 17);
            appeal = {
              kind: ATTENDANCE_APPEAL_KIND,
              attendanceId: issue.attendanceId,
              mode: 'DAILY',
              date: toDateKey(issue.attendanceDate),
              markedStatus: issue.status,
              previousTimeIn: issue.checkInTime?.toISOString() ?? null,
              previousTimeOut: issue.checkOutTime?.toISOString() ?? null,
              requestedTimeIn: leaveStartDate.toISOString(),
              requestedTimeOut: leaveEndDate.toISOString(),
              reason,
            };
          }
          description = appeal as unknown as Record<string, unknown>;
        }

        const title = type === 'TIME_ADJUSTMENT'
          ? `Attendance Appeal - ${String(description.date)} - ${requestId}`
          : `${type} Request - ${requestId}`;
        const reviewedAt = reviewer
          ? new Date(Math.min(now.getTime(), filedAt.getTime() + (1 + random() * 20) * 3_600_000))
          : filedAt;

        requestRows.push({
          requestId,
          type,
          status,
          title,
          description: JSON.stringify(description),
          remarks: status === 'PENDING' ? null : pick(reviewRemarks[status] ?? [''], random) || null,
          leaveStartDate,
          leaveEndDate,
          employeeId: employee.userId,
          reviewedById: reviewer?.userId ?? null,
          campusId: campus.campusId,
          departmentId: employee.departmentId,
          createdAt: filedAt,
          updatedAt: reviewedAt,
        });
      }
    }
  }

  const existingIds = new Set(
    (await prisma.requestRecord.findMany({
      where: { requestId: { in: requestRows.map((row) => row.requestId) } },
      select: { requestId: true },
    })).map((row) => row.requestId),
  );
  const newRequests = requestRows.filter((row) => !existingIds.has(row.requestId));

  await prisma.$transaction(async (tx) => {
    await tx.requestRecord.createMany({ data: newRequests, skipDuplicates: true });
    // Approved appeals mark their attendance as present, same as approving in the HR portal.
    await applyApprovedAttendanceAppeals(tx, newRequests.filter((row) => row.status === 'APPROVED'));
  }, { timeout: 60_000 });

  const summary = newRequests.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Requests added: ${newRequests.length}`, summary);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
