import React from 'react';
import type {
  EmployeePortalContextValue,
  EmployeeRequestDraft,
  EmployeeRequestRecord,
  EmployeeRequestType,
} from './employeePortalTypes';
import { useAuth } from '../../../context/AuthContext';
import { EmployeeType, RequestStatus } from '../../../types';
import {
  fetchEmployeeDashboard,
  fetchEmployeeRequests,
  submitEmployeeRequest,
  submitAttendanceAppeal,
  fetchEmployeeAttendance,
  fetchEmployeeMemos,
  acknowledgeMemo as apiAcknowledgeMemo
} from '../../../lib/employee-api';

const API_REQUEST_TYPE_TO_EMPLOYEE_TYPE: Record<string, EmployeeRequestType> = {
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  UNDERTIME: 'undertime',
  TIME_ADJUSTMENT: 'attendance',
  SHIFT_ASSIGNMENT: 'change_shift',
  SWAP_REQUEST: 'swap',
};

const toRequestStatus = (status: string | null | undefined): RequestStatus => {
  const normalized = String(status ?? '').toLowerCase();
  return (Object.values(RequestStatus) as string[]).includes(normalized)
    ? (normalized as RequestStatus)
    : RequestStatus.PENDING;
};

const parseRequestFields = (description: string | null | undefined): Record<string, any> => {
  if (!description || !description.trim().startsWith('{')) {
    return {};
  }

  try {
    return JSON.parse(description);
  } catch {
    return {};
  }
};

const EmployeePortalContext = React.createContext<EmployeePortalContextValue | null>(null);

export const EmployeePortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;
  
  const [attendanceEntries, setAttendanceEntries] = React.useState<any[]>([]);
  const [memos, setMemos] = React.useState<any[]>([]);
  const [requests, setRequests] = React.useState<any[]>([]);
  
  const refreshData = React.useCallback(async () => {
    try {
      const [reqData, attData, memoData] = await Promise.all([
        fetchEmployeeRequests(),
        fetchEmployeeAttendance(),
        fetchEmployeeMemos()
      ]);
      
      const requestRows: any[] = reqData.data || [];
      setRequests(requestRows);

      // Latest appeal per attendance record (rows arrive newest first).
      const appealByAttendanceId = new Map<string, { status: RequestStatus; remarks: string | null }>();
      requestRows.forEach((row) => {
        const appeal = parseRequestFields(row.description);
        const attendanceId = appeal.kind === 'ATTENDANCE_APPEAL' ? String(appeal.attendanceId ?? '') : '';
        if (attendanceId && !appealByAttendanceId.has(attendanceId)) {
          appealByAttendanceId.set(attendanceId, {
            status: toRequestStatus(row.status),
            remarks: row.remarks ?? null,
          });
        }
      });

      const combinedAttendance = [
        ...(attData.data?.nonTeachingAttendance || []),
        ...(attData.data?.teachingAttendance || [])
      ].map(entry => {
        const attendanceId = entry.id || entry.attendanceId;
        const appeal = appealByAttendanceId.get(attendanceId);
        return {
          id: attendanceId,
          appealStatus: appeal?.status ?? null,
          appealRemarks: appeal?.remarks ?? null,
          date: new Date(entry.attendanceDate || entry.classSession?.sessionDate || entry.date || new Date()).toISOString().split('T')[0],
          mode: entry.classSessionId ? 'TEACHING_SESSION' : 'DAILY',
          campus: entry.campusId || entry.schoolId,
          shift: null,
          timeIn: entry.checkInTime || entry.classSession?.startsAt || entry.timeIn || null,
          timeOut: entry.checkOutTime || entry.classSession?.endsAt || entry.timeOut || null,
          status: entry.status,
          subjectCode: entry.classSession?.subject?.code,
          subjectName: entry.classSession?.subject?.name,
          room: entry.classSession?.room,
          sessionStart: entry.classSession?.startsAt,
          sessionEnd: entry.classSession?.endsAt,
        };
      });
      setAttendanceEntries(combinedAttendance);
      
      setMemos(memoData.data || []);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const submitRequest = React.useCallback(async (draft: EmployeeRequestDraft): Promise<any> => {
    // Map draft type to real request type
    const requestTypeMap: Record<string, string> = {
      'leave': 'LEAVE',
      'overtime': 'OVERTIME',
      'undertime': 'UNDERTIME',
      'attendance': 'TIME_ADJUSTMENT', // closest match
      'change_shift': 'SHIFT_ASSIGNMENT',
      'swap': 'SWAP_REQUEST',
    };
    
    const mappedType = requestTypeMap[draft.type] || 'LEAVE';
    const field = (key: string): string => String(draft.fields[key] ?? '').trim();
    const toIso = (value: string): string | undefined => {
      const parsed = value ? new Date(value) : null;
      return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : undefined;
    };

    // Give HR a schedule to show/filter by for every request type.
    let scheduleStart =
      toIso(field('startDate')) ?? toIso(field('startDateTime'));
    let scheduleEnd =
      toIso(field('endDate')) ?? toIso(field('endDateTime'));
    if (draft.type === 'undertime' && field('undertimeDate')) {
      scheduleStart = toIso(`${field('undertimeDate')}T${field('specifiedTimeOut') || '00:00'}`);
      scheduleEnd = scheduleStart;
    }
    if (draft.type === 'attendance' && field('date')) {
      scheduleStart = toIso(`${field('date')}T${field('timeIn') || '00:00'}`);
      scheduleEnd = toIso(`${field('date')}T${field('timeOut') || '23:59'}`);
    }

    const payload = {
      type: mappedType,
      title: `${draft.type.toUpperCase()} Request - ${Date.now()}`,
      description: JSON.stringify(draft.fields),
      remarks: '',
      leaveStartDate: scheduleStart,
      leaveEndDate: scheduleEnd,
    };
    
    const result = await submitEmployeeRequest(payload);
    await refreshData();
    return result;
  }, [refreshData]);

  const submitAttendanceEditRequest = React.useCallback(
    async (payload: {
      attendanceEntryId: string;
      timeIn: string;
      timeOut: string;
      reason: string;
    }): Promise<any> => {
      const targetEntry = attendanceEntries.find((entry) => entry.id === payload.attendanceEntryId);
      if (!targetEntry) {
        return null;
      }

      const toIso = (time: string): string | null =>
        time ? new Date(`${targetEntry.date}T${time}:00`).toISOString() : null;

      const result = await submitAttendanceAppeal(targetEntry.id, {
        mode: targetEntry.mode,
        reason: payload.reason,
        ...(targetEntry.mode === 'DAILY'
          ? { requestedTimeIn: toIso(payload.timeIn), requestedTimeOut: toIso(payload.timeOut) }
          : {}),
      });
      await refreshData();
      return result;
    },
    [attendanceEntries, refreshData],
  );

  const acknowledgeMemo = React.useCallback(
    async (memoId: string) => {
      try {
        await apiAcknowledgeMemo(memoId);
        refreshData();
      } catch (err) {
        console.error('Error acknowledging memo:', err);
      }
    },
    [refreshData],
  );

  const value = React.useMemo<EmployeePortalContextValue>(
    () => ({
      attendanceEntries,
      requests: requests.map(r => {
        const fields = parseRequestFields(r.description);
        return {
          id: r.requestId,
          type: API_REQUEST_TYPE_TO_EMPLOYEE_TYPE[r.type] ?? r.type.toLowerCase(),
          status: toRequestStatus(r.status),
          submittedAt: r.createdAt,
          summary: r.title,
          scheduleFrom: r.leaveStartDate,
          scheduleTo: r.leaveEndDate,
          remarks: r.remarks,
          fields
        };
      }),
      memos: memos.map(m => ({
        id: m.memoId,
        title: m.title,
        content: m.content || '',
        publishedAt: m.publishedAt,
        effectiveDate: m.effectiveDate,
        memoType: m.memoType || 'General',
        attachments: m.attachments || [],
        targetScope: { type: m.scopeType || 'GLOBAL', targetId: m.campusId || null },
        to: m.recipientEmployeeId ? [m.recipientEmployeeId] : [],
        agenda: m.title,
        dateCreated: m.createdAt || m.publishedAt,
        status: 'published',
        requiresAcknowledgement: Boolean(m.requiresAcknowledgement),
        acknowledgements: m.acknowledgements?.map((ack: any) => ({
          id: ack.id,
          employeeId: ack.employeeId,
          name: `${ack.employee.firstName} ${ack.employee.lastName}`.trim(),
          position: ack.employee.position ?? 'Unassigned',
          avatarUrl: ack.employee.profileImage ?? undefined,
          acknowledgedAt: ack.acknowledgedAt,
        })) || []
      })),
      submitRequest: submitRequest as any,
      submitAttendanceEditRequest: submitAttendanceEditRequest as any,
      acknowledgeMemo,
    }),
    [attendanceEntries, memos, requests, submitAttendanceEditRequest, submitRequest, acknowledgeMemo],
  );

  return <EmployeePortalContext.Provider value={value}>{children}</EmployeePortalContext.Provider>;
};

export const useEmployeePortal = (): EmployeePortalContextValue => {
  const context = React.useContext(EmployeePortalContext);
  if (!context) {
    throw new Error('useEmployeePortal must be used within EmployeePortalProvider');
  }

  return context;
};
export default EmployeePortalProvider;
