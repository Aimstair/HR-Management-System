import React from 'react';
import {
  createEmployeeRequestRecord,
  getInitialAttendanceEntries,
  getInitialEmployeeRequests,
  initialEmployeeMemos,
} from './employeePortalData';
import type {
  EmployeePortalContextValue,
  EmployeeRequestDraft,
  EmployeeRequestRecord,
} from './employeePortalTypes';
import { useAuth } from '../../../context/AuthContext';
import { EmployeeType } from '../../../types';

const EmployeePortalContext = React.createContext<EmployeePortalContextValue | null>(null);

const EmployeePortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;
  const attendanceEntries = React.useMemo(
    () => getInitialAttendanceEntries(employeeType),
    [employeeType],
  );
  const [memos] = React.useState(initialEmployeeMemos);
  const [requests, setRequests] = React.useState(() => getInitialEmployeeRequests(employeeType));

  React.useEffect(() => {
    setRequests(getInitialEmployeeRequests(employeeType));
  }, [employeeType]);

  const submitRequest = React.useCallback((draft: EmployeeRequestDraft): EmployeeRequestRecord => {
    const next = createEmployeeRequestRecord(draft);
    setRequests((current) => [next, ...current]);
    return next;
  }, []);

  const submitAttendanceEditRequest = React.useCallback(
    (payload: {
      attendanceEntryId: string;
      timeIn: string;
      timeOut: string;
      reason: string;
    }): EmployeeRequestRecord | null => {
      const targetEntry = attendanceEntries.find((entry) => entry.id === payload.attendanceEntryId);
      if (!targetEntry) {
        return null;
      }

      if (targetEntry.mode === 'TEACHING_SESSION') {
        const status = targetEntry.status ?? 'PRESENT';

        return submitRequest({
          type: 'attendance',
          fields: {
            sessionDate: targetEntry.date,
            subject: `${targetEntry.subjectCode ?? 'SUBJECT'} - ${targetEntry.subjectName ?? 'Session'}`,
            classSession: targetEntry.id,
            markedStatus: status,
            reason: payload.reason,
          },
        });
      }

      return submitRequest({
        type: 'attendance',
        fields: {
          date: targetEntry.date,
          campus: targetEntry.campus,
          timeIn: payload.timeIn,
          timeOut: payload.timeOut,
          reason: payload.reason,
        },
      });
    },
    [attendanceEntries, submitRequest],
  );

  const value = React.useMemo<EmployeePortalContextValue>(
    () => ({
      attendanceEntries,
      requests,
      memos,
      submitRequest,
      submitAttendanceEditRequest,
    }),
    [attendanceEntries, memos, requests, submitAttendanceEditRequest, submitRequest],
  );

  return <EmployeePortalContext.Provider value={value}>{children}</EmployeePortalContext.Provider>;
};

const useEmployeePortal = (): EmployeePortalContextValue => {
  const context = React.useContext(EmployeePortalContext);
  if (!context) {
    throw new Error('useEmployeePortal must be used within EmployeePortalProvider');
  }

  return context;
};

export { EmployeePortalProvider, useEmployeePortal };
