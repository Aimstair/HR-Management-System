import type { Prisma } from '@prisma/client';

export const ATTENDANCE_APPEAL_KIND = 'ATTENDANCE_APPEAL';

export type AttendanceAppealMode = 'DAILY' | 'TEACHING_SESSION';

export interface AttendanceAppealDetails {
  kind: typeof ATTENDANCE_APPEAL_KIND;
  attendanceId: string;
  mode: AttendanceAppealMode;
  date: string;
  markedStatus: string;
  reason: string;
  subject?: string | null;
  previousTimeIn?: string | null;
  previousTimeOut?: string | null;
  requestedTimeIn?: string | null;
  requestedTimeOut?: string | null;
}

export const parseAttendanceAppeal = (description: string | null | undefined): AttendanceAppealDetails | null => {
  if (!description || !description.trim().startsWith('{')) {
    return null;
  }

  try {
    const parsed = JSON.parse(description);
    if (parsed?.kind === ATTENDANCE_APPEAL_KIND && typeof parsed.attendanceId === 'string') {
      return parsed as AttendanceAppealDetails;
    }
  } catch {
    // Not an appeal payload.
  }

  return null;
};

const appendRemark = (existing: string | null, note: string): string => {
  return existing && existing.trim().length > 0 ? `${existing.trim()} | ${note}` : note;
};

/**
 * Marks the attendance records behind approved attendance appeals as PRESENT.
 * Only requests transitioning into APPROVED should be passed in.
 */
export const applyApprovedAttendanceAppeals = async (
  tx: Prisma.TransactionClient,
  requests: Array<{ requestId: string; type: string; employeeId: string; description: string | null }>,
): Promise<void> => {
  for (const request of requests) {
    if (request.type !== 'TIME_ADJUSTMENT') {
      continue;
    }

    const appeal = parseAttendanceAppeal(request.description);
    if (!appeal) {
      continue;
    }

    const note = `Appeal approved (request ${request.requestId})`;

    if (appeal.mode === 'TEACHING_SESSION') {
      const attendance = await tx.teachingAttendance.findFirst({
        where: { attendanceId: appeal.attendanceId, employeeId: request.employeeId },
        select: { attendanceId: true, remarks: true },
      });

      if (!attendance) {
        continue;
      }

      await tx.teachingAttendance.update({
        where: { attendanceId: attendance.attendanceId },
        data: {
          status: 'PRESENT',
          minutesLate: 0,
          remarks: appendRemark(attendance.remarks, note),
        },
      });
      continue;
    }

    const attendance = await tx.nonTeachingAttendance.findFirst({
      where: { attendanceId: appeal.attendanceId, employeeId: request.employeeId },
      select: { attendanceId: true, remarks: true },
    });

    if (!attendance) {
      continue;
    }

    const checkInTime = appeal.requestedTimeIn ? new Date(appeal.requestedTimeIn) : null;
    const checkOutTime = appeal.requestedTimeOut ? new Date(appeal.requestedTimeOut) : null;

    await tx.nonTeachingAttendance.update({
      where: { attendanceId: attendance.attendanceId },
      data: {
        status: 'PRESENT',
        minutesLate: 0,
        ...(checkInTime && !Number.isNaN(checkInTime.getTime()) ? { checkInTime } : {}),
        ...(checkOutTime && !Number.isNaN(checkOutTime.getTime()) ? { checkOutTime } : {}),
        remarks: appendRemark(attendance.remarks, note),
      },
    });
  }
};
