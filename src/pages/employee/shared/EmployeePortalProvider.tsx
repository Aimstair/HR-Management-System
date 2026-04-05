import React from 'react';
import { createEmployeeRequestRecord, initialAttendanceEntries, initialEmployeeMemos, initialEmployeeRequests } from './employeePortalData';
import type {
  EmployeePortalContextValue,
  EmployeeRequestDraft,
  EmployeeRequestRecord,
} from './employeePortalTypes';

const EmployeePortalContext = React.createContext<EmployeePortalContextValue | null>(null);

const EmployeePortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceEntries] = React.useState(initialAttendanceEntries);
  const [memos] = React.useState(initialEmployeeMemos);
  const [requests, setRequests] = React.useState(initialEmployeeRequests);

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
