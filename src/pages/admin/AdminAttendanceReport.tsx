import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Plus, Table2, BarChart3, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { EmployeeType, isAdminRole } from '../../types';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import type { EmployeeTypeFilter } from '../../components/hr/EmployeeTypeSegmentedControl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import EmployeeListPanel from './reports/attendance/components/EmployeeListPanel';
import DtrTable from './reports/attendance/components/DtrTable';
import EditAttendanceDialog from './reports/attendance/components/EditAttendanceDialog';
import AddTimeDialog from './reports/attendance/components/AddTimeDialog';
import ExportDialog from './reports/attendance/components/ExportDialog';
import GraphsPanel from './reports/attendance/components/GraphsPanel';
import DateFilterDialog from './reports/attendance/components/DateFilterDialog';
import type {
  AddTimeFormValues,
  DtrEntry,
  DtrFilterState,
  ExportRangeMode,
  GraphFilterState,
  GraphFilterMode,
  ReportEmployee,
  ShiftType,
  TeachingClassSessionOption,
} from './reports/attendance/types';
import {
  buildGraphData,
  computeLateMinutes,
  computeWorkMinutes,
  downloadCsv,
  formatDate,
  formatDateTime,
  formatDuration,
  toCsv,
} from './reports/attendance/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import {
  createAdminTeachingAttendance,
  createAdminNonTeachingAttendance,
  getAdminEmployees,
  getAdminNonTeachingAttendance,
  getAdminTeachingClassSessions,
  getAdminTeachingAttendance,
  updateAdminTeachingAttendance,
  updateAdminNonTeachingAttendance,
  type AdminEmployeeRecord,
  type AdminTeachingClassSessionRecord,
  type AdminNonTeachingAttendanceRecord,
  type AdminTeachingAttendanceRecord,
  type AdminTeachingAttendanceListQuery,
  type AdminNonTeachingAttendanceListQuery,
} from '../../lib/admin-api';

const defaultDtrFilter: DtrFilterState = {
  mode: 'last30',
  month: '',
  rangeStart: '',
  rangeEnd: '',
};

const defaultGraphFilter: GraphFilterState = {
  mode: 'last30',
  month: '',
  campus: 'all',
};

const DEFAULT_PAGE_LIMIT = 200;

const collectPaged = async <T,>(
  fetchPage: (page: number) => Promise<{ rows: T[]; pagination: { totalPages: number } }>,
): Promise<T[]> => {
  const rows: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchPage(page);
    rows.push(...response.rows);
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return rows;
};

const toReportEmployee = (employee: AdminEmployeeRecord): ReportEmployee => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  return {
    id: employee.id,
    fullName,
    department: employee.departmentModel?.name ?? employee.department ?? 'Unassigned',
    position: employee.position ?? 'Unassigned',
    campus: employee.school?.name ?? employee.schoolBranch ?? 'Unknown Campus',
    campusId: employee.school?.id ?? employee.schoolId ?? null,
    schoolId: employee.school?.id ?? employee.schoolId ?? null,
    departmentId: employee.departmentModel?.id ?? employee.departmentId ?? null,
    employeeType: employee.employeeType,
    avatarUrl: employee.profileImage ?? undefined,
  };
};

const toShiftFromTime = (iso?: string | null): ShiftType => {
  if (!iso) {
    return 'Flexible';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Flexible';
  }

  const hour = date.getHours();
  if (hour < 9) {
    return 'Morning';
  }
  if (hour < 14) {
    return 'Mid';
  }
  if (hour < 20) {
    return 'Night';
  }
  return 'Night';
};

const toTeachingEntry = (row: AdminTeachingAttendanceRecord): DtrEntry => {
  return {
    id: row.id,
    employeeId: row.employeeId,
    classSessionId: row.classSession.id,
    date: row.classSession.sessionDate.slice(0, 10),
    shift: toShiftFromTime(row.classSession.startsAt),
    timeIn: row.classSession.startsAt,
    timeOut: row.classSession.endsAt,
    subjectCode: row.classSession.subject.code,
    subjectName: row.classSession.subject.name,
    remarks: row.remarks ?? undefined,
    attendanceStatus: row.status,
  };
};

const toAttendanceStatus = (
  status: AdminNonTeachingAttendanceRecord['status'],
): DtrEntry['attendanceStatus'] => {
  if (status === 'PRESENT' || status === 'LATE' || status === 'ABSENT') {
    return status;
  }

  return undefined;
};

const toNonTeachingEntry = (row: AdminNonTeachingAttendanceRecord): DtrEntry => {
  const baseDate = row.attendanceDate.slice(0, 10);
  const timeIn = row.checkInTime ?? `${baseDate}T00:00:00`;
  const timeOut = row.checkOutTime ?? timeIn;

  return {
    id: row.id,
    employeeId: row.employeeId,
    date: baseDate,
    shift: toShiftFromTime(row.checkInTime ?? row.attendanceDate),
    timeIn,
    timeOut,
    remarks: row.remarks ?? undefined,
    attendanceStatus: toAttendanceStatus(row.status),
  };
};

const toTeachingSessionOption = (
  row: AdminTeachingClassSessionRecord,
): TeachingClassSessionOption => {
  return {
    id: row.id,
    label: `${row.subject.code} - ${row.subject.name} (${formatDate(row.sessionDate)})`,
    sessionDate: row.sessionDate,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    subjectCode: row.subject.code,
    subjectName: row.subject.name,
    room: row.room,
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const toMonthRange = (monthValue: string): { from: string; to: string } | null => {
  if (!monthValue) {
    return null;
  }

  const [year, month] = monthValue.split('-').map(Number);
  if (!year || !month) {
    return null;
  }

  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { from: start.toISOString(), to: end.toISOString() };
};

const resolveDtrRange = (filter: DtrFilterState): { from: string; to: string } => {
  const now = new Date();

  if (filter.mode === 'month') {
    return toMonthRange(filter.month) ?? resolveDtrRange({ ...filter, mode: 'last30' });
  }

  if (filter.mode === 'range' && filter.rangeStart && filter.rangeEnd) {
    const start = new Date(filter.rangeStart);
    const end = new Date(filter.rangeEnd);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return { from: start.toISOString(), to: end.toISOString() };
    }
  }

  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return { from: start.toISOString(), to: now.toISOString() };
};

const resolveGraphRange = (filter: GraphFilterState): { from: string; to: string } => {
  const now = new Date();

  if (filter.mode === 'thisWeek') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: now.toISOString() };
  }

  if (filter.mode === 'month') {
    return toMonthRange(filter.month) ?? resolveGraphRange({ ...filter, mode: 'last30' });
  }

  if (filter.mode === 'ytd') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    return { from: start.toISOString(), to: now.toISOString() };
  }

  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return { from: start.toISOString(), to: now.toISOString() };
};

const resolveExportRange = (
  mode: ExportRangeMode,
  month: string,
  start: string,
  end: string,
): { from: string; to: string } => {
  if (mode === 'month') {
    return toMonthRange(month) ?? resolveDtrRange(defaultDtrFilter);
  }

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      return { from: startDate.toISOString(), to: endDate.toISOString() };
    }
  }

  return resolveDtrRange(defaultDtrFilter);
};

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user ? isAdminRole(user.role) : false;
  const isHeadHr = user?.role === 'ROLE_HEAD_HR';

  const [employees, setEmployees] = useState<ReportEmployee[]>([]);
  const [tableEntries, setTableEntries] = useState<DtrEntry[]>([]);
  const [graphEntries, setGraphEntries] = useState<DtrEntry[]>([]);
  const [teachingSessions, setTeachingSessions] = useState<TeachingClassSessionOption[]>([]);
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<EmployeeTypeFilter>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [dtrFilter, setDtrFilter] = useState<DtrFilterState>(defaultDtrFilter);
  const [graphFilter, setGraphFilter] = useState<GraphFilterState>(defaultGraphFilter);
  const [graphEmployeeType, setGraphEmployeeType] = useState<EmployeeType>(EmployeeType.NON_TEACHING);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const [editEntry, setEditEntry] = useState<DtrEntry | null>(null);
  const [isAddTimeOpen, setIsAddTimeOpen] = useState<boolean>(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState<boolean>(false);
  const [isCurrentExportOpen, setIsCurrentExportOpen] = useState<boolean>(false);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState<boolean>(false);
  const [headerActionsEl, setHeaderActionsEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeaderActionsEl(document.getElementById('header-actions'));
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadEmployees = async (): Promise<void> => {
      try {
        const rows = await collectPaged((page) =>
          getAdminEmployees({ page, limit: DEFAULT_PAGE_LIMIT, isActive: true }),
        );
        if (!isActive) {
          return;
        }
        setEmployees(rows.map(toReportEmployee));
      } catch (error) {
        if (isActive) {
          toast.error(getErrorMessage(error, 'Unable to load employees.'));
          setEmployees([]);
        }
      } finally {
        if (isActive) {
        }
      }
    };

    loadEmployees();
    return () => {
      isActive = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const typeFiltered =
      employeeTypeFilter === 'ALL'
        ? employees
        : employees.filter((employee) => employee.employeeType === employeeTypeFilter);

    if (departmentFilter === 'all') {
      return typeFiltered;
    }

    return typeFiltered.filter((employee) => employee.department === departmentFilter);
  }, [departmentFilter, employeeTypeFilter, employees]);

  useEffect(() => {
    if (!filteredEmployees.length) {
      setSelectedEmployeeId(null);
      return;
    }

    const isCurrentVisible = filteredEmployees.some((employee) => employee.id === selectedEmployeeId);
    if (!isCurrentVisible) {
      setSelectedEmployeeId(filteredEmployees[0].id);
    }
  }, [filteredEmployees, selectedEmployeeId]);

  const selectedEmployee = useMemo(() => {
    return filteredEmployees.find((employee) => employee.id === selectedEmployeeId) ?? null;
  }, [filteredEmployees, selectedEmployeeId]);

  const selectedEmployeeEntries = useMemo(() => {
    return tableEntries.filter((entry) => entry.employeeId === selectedEmployeeId);
  }, [tableEntries, selectedEmployeeId]);

  const teachingSubjects = useMemo(() => {
    if (selectedEmployee?.employeeType !== EmployeeType.TEACHING) {
      return [] as Array<{ code: string; label: string }>;
    }

    const uniqueSubjects = new Map<string, string>();

    selectedEmployeeEntries.forEach((entry) => {
      if (!entry.subjectCode) {
        return;
      }

      uniqueSubjects.set(entry.subjectCode, entry.subjectName ?? entry.subjectCode);
    });

    return Array.from(uniqueSubjects.entries()).map(([code, label]) => ({ code, label }));
  }, [selectedEmployee?.employeeType, selectedEmployeeEntries]);

  useEffect(() => {
    if (selectedEmployee?.employeeType !== EmployeeType.TEACHING) {
      setSubjectFilter('all');
      return;
    }

    if (subjectFilter !== 'all' && !teachingSubjects.some((subject) => subject.code === subjectFilter)) {
      setSubjectFilter('all');
    }
  }, [selectedEmployee?.employeeType, subjectFilter, teachingSubjects]);

  const filteredEntries = useMemo(() => {
    const subjectFiltered =
      selectedEmployee?.employeeType === EmployeeType.TEACHING && subjectFilter !== 'all'
        ? selectedEmployeeEntries.filter((entry) => entry.subjectCode === subjectFilter)
        : selectedEmployeeEntries;
    return subjectFiltered;
  }, [selectedEmployee?.employeeType, selectedEmployeeEntries, subjectFilter]);

  const graphEmployees = useMemo(
    () => employees.filter((employee) => employee.employeeType === graphEmployeeType),
    [employees, graphEmployeeType],
  );

  const graphData = useMemo(() => {
    return buildGraphData(graphEmployees, graphEntries, graphFilter);
  }, [graphEmployees, graphEntries, graphFilter]);

  const dtrFilterLabel = useMemo(() => {
    if (dtrFilter.mode === 'month' && dtrFilter.month) {
      const [year, month] = dtrFilter.month.split('-').map(Number);
      if (!year || !month) {
        return 'Month not set';
      }
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
        new Date(year, month - 1, 1),
      );
    }

    if (dtrFilter.mode === 'range' && dtrFilter.rangeStart && dtrFilter.rangeEnd) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return `${formatter.format(new Date(dtrFilter.rangeStart))} to ${formatter.format(new Date(dtrFilter.rangeEnd))}`;
    }

    if (dtrFilter.mode === 'range') {
      return 'Date range not set';
    }

    if (dtrFilter.mode === 'month') {
      return 'Month not set';
    }

    return 'Last 30 Days';
  }, [dtrFilter]);

  const canAddTime = Boolean(
    selectedEmployee &&
    (selectedEmployee.employeeType !== EmployeeType.TEACHING || teachingSessions.length > 0),
  );

  const campusOptions = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((employee) => {
      if (employee.campusId) {
        map.set(employee.campusId, employee.campus);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  useEffect(() => {
    if (graphFilter.campus === 'all') {
      return;
    }

    const exists = campusOptions.some((campus) => campus.id === graphFilter.campus);
    if (!exists) {
      setGraphFilter((current) => ({ ...current, campus: 'all' }));
    }
  }, [campusOptions, graphFilter.campus]);

  useEffect(() => {
    if (!selectedEmployee || selectedEmployee.employeeType !== EmployeeType.TEACHING) {
      setTeachingSessions([]);
      return;
    }

    let isActive = true;

    const loadTeachingSessions = async (): Promise<void> => {
      try {
        const range = resolveDtrRange(dtrFilter);
        const rows = await collectPaged((page) =>
          getAdminTeachingClassSessions({
            employeeId: selectedEmployee.id,
            from: range.from,
            to: range.to,
            page,
            limit: DEFAULT_PAGE_LIMIT,
          }),
        );
        if (isActive) {
          setTeachingSessions(rows.map(toTeachingSessionOption));
        }
      } catch (error) {
        if (isActive) {
          toast.error(getErrorMessage(error, 'Unable to load class sessions.'));
          setTeachingSessions([]);
        }
      }
    };

    loadTeachingSessions();
    return () => {
      isActive = false;
    };
  }, [dtrFilter, selectedEmployee]);

  useEffect(() => {
    if (!selectedEmployee) {
      setTableEntries([]);
      return;
    }

    let isActive = true;

    const loadEntries = async (): Promise<void> => {
      try {
        const range = resolveDtrRange(dtrFilter);
        if (selectedEmployee.employeeType === EmployeeType.TEACHING) {
          const rows = await collectPaged((page) =>
            getAdminTeachingAttendance({
              employeeId: selectedEmployee.id,
              from: range.from,
              to: range.to,
              page,
              limit: DEFAULT_PAGE_LIMIT,
            }),
          );
          if (isActive) {
            setTableEntries(rows.map(toTeachingEntry));
          }
        } else {
          const rows = await collectPaged((page) =>
            getAdminNonTeachingAttendance({
              employeeId: selectedEmployee.id,
              from: range.from,
              to: range.to,
              page,
              limit: DEFAULT_PAGE_LIMIT,
            }),
          );
          if (isActive) {
            setTableEntries(rows.map(toNonTeachingEntry));
          }
        }
      } catch (error) {
        if (isActive) {
          toast.error(getErrorMessage(error, 'Unable to load attendance records.'));
          setTableEntries([]);
        }
      } finally {
        if (isActive) {
        }
      }
    };

    loadEntries();
    return () => {
      isActive = false;
    };
  }, [dtrFilter, selectedEmployee]);

  useEffect(() => {
    if (viewMode !== 'graph' || employees.length === 0) {
      return;
    }

    let isActive = true;

    const loadGraphEntries = async (): Promise<void> => {
      try {
        const range = resolveGraphRange(graphFilter);
        const schoolId = graphFilter.campus === 'all' ? undefined : graphFilter.campus;

        const [teachingRows, nonTeachingRows] = await Promise.all([
          collectPaged((page) =>
            getAdminTeachingAttendance({
              from: range.start.toISOString(),
              to: range.end.toISOString(),
              schoolId,
              page,
              limit: DEFAULT_PAGE_LIMIT,
            }),
          ),
          collectPaged((page) =>
            getAdminNonTeachingAttendance({
              from: range.start.toISOString(),
              to: range.end.toISOString(),
              schoolId,
              page,
              limit: DEFAULT_PAGE_LIMIT,
            }),
          ),
        ]);

        if (isActive) {
          setGraphEntries([
            ...teachingRows.map(toTeachingEntry),
            ...nonTeachingRows.map(toNonTeachingEntry),
          ]);
        }
      } catch (error) {
        if (isActive) {
          toast.error(getErrorMessage(error, 'Unable to load graph data.'));
          setGraphEntries([]);
        }
      } finally {
        if (isActive) {
        }
      }
    };

    loadGraphEntries();
    return () => {
      isActive = false;
    };
  }, [employees.length, graphFilter, viewMode]);

  const fetchTeachingEntries = async (
    query: AdminTeachingAttendanceListQuery,
  ): Promise<DtrEntry[]> => {
    const rows = await collectPaged((page) =>
      getAdminTeachingAttendance({
        ...query,
        page,
        limit: DEFAULT_PAGE_LIMIT,
      }),
    );
    return rows.map(toTeachingEntry);
  };

  const fetchNonTeachingEntries = async (
    query: AdminNonTeachingAttendanceListQuery,
  ): Promise<DtrEntry[]> => {
    const rows = await collectPaged((page) =>
      getAdminNonTeachingAttendance({
        ...query,
        page,
        limit: DEFAULT_PAGE_LIMIT,
      }),
    );
    return rows.map(toNonTeachingEntry);
  };

  const applyEditAttendance = async (
    entryId: string,
    payload:
      | Pick<DtrEntry, 'shift' | 'timeIn' | 'timeOut'>
      | { classSessionId: string; status: NonNullable<DtrEntry['attendanceStatus']>; remarks: string },
  ): Promise<void> => {
    if (!selectedEmployee) {
      return;
    }

    if (selectedEmployee.employeeType === EmployeeType.TEACHING) {
      if (!('classSessionId' in payload)) {
        return;
      }

      try {
        const response = await updateAdminTeachingAttendance(entryId, {
          classSessionId: payload.classSessionId,
          status: payload.status,
          remarks: payload.remarks || null,
        });

        const updatedEntry = toTeachingEntry(response.attendance);
        setTableEntries((current) =>
          current.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
        );
        setGraphEntries((current) =>
          current.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
        );
        toast.success('Teaching attendance updated.');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Unable to update teaching attendance.'));
      }
      return;
    }

    if (!('timeIn' in payload) || !payload.timeIn || !payload.timeOut) {
      toast.error('Time in/out is required.');
      return;
    }

    const date = payload.timeIn.slice(0, 10);
    const draftEntry: DtrEntry = {
      id: entryId,
      employeeId: selectedEmployee.id,
      date,
      shift: payload.shift,
      timeIn: payload.timeIn,
      timeOut: payload.timeOut,
    };
    const minutesLate = computeLateMinutes(draftEntry);
    const status = minutesLate > 0 ? 'LATE' : 'PRESENT';

    try {
      const response = await updateAdminNonTeachingAttendance(entryId, {
        attendanceDate: date,
        checkInTime: payload.timeIn,
        checkOutTime: payload.timeOut,
        status,
        minutesLate,
      });

      const updatedEntry = {
        ...toNonTeachingEntry(response.attendance),
        shift: payload.shift,
      };
      setTableEntries((current) =>
        current.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
      );
      setGraphEntries((current) =>
        current.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
      );
      toast.success('Attendance entry updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update attendance entry.'));
    }
  };

  const addTime = async (values: AddTimeFormValues): Promise<void> => {
    if (!selectedEmployee) {
      return;
    }

    if (selectedEmployee.employeeType === EmployeeType.TEACHING) {
      if (!values.classSessionId) {
        toast.error('Select a class session first.');
        return;
      }

      try {
        const response = await createAdminTeachingAttendance({
          employeeId: values.employeeId,
          classSessionId: values.classSessionId,
          status: values.status ?? 'PRESENT',
          remarks: values.notes || null,
        });

        const newEntry = toTeachingEntry(response.attendance);
        setTableEntries((current) => [newEntry, ...current]);
        setGraphEntries((current) => [newEntry, ...current]);
        toast.success('Teaching attendance added.');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Unable to add teaching attendance.'));
      }
      return;
    }

    if (!values.start || !values.end) {
      toast.error('Start and end times are required.');
      return;
    }

    const shift = toShiftFromTime(values.start);
    const date = values.start.slice(0, 10);
    const draftEntry: DtrEntry = {
      id: 'draft',
      employeeId: values.employeeId,
      date,
      shift,
      timeIn: values.start,
      timeOut: values.end,
    };
    const minutesLate = computeLateMinutes(draftEntry);
    const status = minutesLate > 0 ? 'LATE' : 'PRESENT';

    try {
      const response = await createAdminNonTeachingAttendance({
        employeeId: values.employeeId,
        schoolId: selectedEmployee.schoolId ?? undefined,
        departmentId: selectedEmployee.departmentId ?? undefined,
        attendanceDate: date,
        status,
        checkInTime: values.start,
        checkOutTime: values.end,
        remarks: values.notes,
        minutesLate,
      });

      const newEntry = {
        ...toNonTeachingEntry(response.attendance),
        shift,
      };
      setTableEntries((current) => [newEntry, ...current]);
      setGraphEntries((current) => [newEntry, ...current]);
      toast.success('Time added successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to add attendance time.'));
    }
  };

  const exportCurrentCsv = async (
    mode: ExportRangeMode,
    month: string,
    start: string,
    end: string,
  ): Promise<void> => {
    if (!selectedEmployee) {
      return;
    }

    try {
      const range = resolveExportRange(mode, month, start, end);
      const query = {
        employeeId: selectedEmployee.id,
        from: range.from,
        to: range.to,
      };

      const rows =
        selectedEmployee.employeeType === EmployeeType.TEACHING
          ? await fetchTeachingEntries(query)
          : await fetchNonTeachingEntries(query);

      const csv = toCsv(
        ['Date', 'Shift', 'Time In', 'Time Out', 'Late', 'Work Hours'],
        rows.map((entry) => [
          formatDate(entry.date),
          entry.shift,
          formatDateTime(entry.timeIn),
          formatDateTime(entry.timeOut),
          formatDuration(computeLateMinutes(entry)),
          formatDuration(computeWorkMinutes(entry)),
        ]),
      );

      downloadCsv(`${selectedEmployee.fullName.replace(/\s+/g, '_')}_attendance.csv`, csv);
      toast.success('Current employee CSV exported.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to export CSV.'));
    }
  };

  const exportBulkCsv = async (
    mode: ExportRangeMode,
    month: string,
    start: string,
    end: string,
  ): Promise<void> => {
    try {
      const range = resolveExportRange(mode, month, start, end);
      const visibleEmployeeIds = new Set(filteredEmployees.map((employee) => employee.id));
      const includeTeaching =
        employeeTypeFilter === 'ALL' || employeeTypeFilter === EmployeeType.TEACHING;
      const includeNonTeaching =
        employeeTypeFilter === 'ALL' || employeeTypeFilter === EmployeeType.NON_TEACHING;

      const [teachingRows, nonTeachingRows] = await Promise.all([
        includeTeaching ? fetchTeachingEntries({ from: range.from, to: range.to }) : Promise.resolve([]),
        includeNonTeaching
          ? fetchNonTeachingEntries({ from: range.from, to: range.to })
          : Promise.resolve([]),
      ]);

      const filtered = [...teachingRows, ...nonTeachingRows].filter((entry) =>
        visibleEmployeeIds.has(entry.employeeId),
      );

      const csv = toCsv(
        ['Employee', 'Department', 'Position', 'Date', 'Shift', 'Time In', 'Time Out', 'Late', 'Work Hours'],
        filtered.map((entry) => {
          const employee = filteredEmployees.find((item) => item.id === entry.employeeId);
          return [
            employee?.fullName ?? 'Unknown',
            employee?.department ?? 'Unknown',
            employee?.position ?? 'Unknown',
            formatDate(entry.date),
            entry.shift,
            formatDateTime(entry.timeIn),
            formatDateTime(entry.timeOut),
            formatDuration(computeLateMinutes(entry)),
            formatDuration(computeWorkMinutes(entry)),
          ];
        }),
      );

      downloadCsv('attendance_bulk_export.csv', csv);
      toast.success('Bulk export generated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to export bulk CSV.'));
    }
  };

  return (
    <div className="relative">
      {headerActionsEl
        ? createPortal(
          <div className="flex items-center gap-2">
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')}>
            <Table2 className="h-4 w-4" />
            Table Mode
          </Button>
          <Button variant={viewMode === 'graph' ? 'default' : 'outline'} onClick={() => setViewMode('graph')}>
            <BarChart3 className="h-4 w-4" />
            Graph Mode
          </Button>
          </div>,
          headerActionsEl,
        )
        : null}

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
          <EmployeeListPanel
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={setSelectedEmployeeId}
            employeeTypeFilter={employeeTypeFilter}
            onEmployeeTypeChange={setEmployeeTypeFilter}
            departmentFilter={departmentFilter}
            onDepartmentChange={setDepartmentFilter}
          />

          <div className="space-y-4">
            <Card>
              <CardHeader className='relative'>
                <CardTitle>DTR Controls</CardTitle>
                <CardDescription>Filter date scope and manage attendance records.</CardDescription>
                <div className="flex flex-wrap gap-2 absolute right-4 top-0">
                  {selectedEmployee?.employeeType === EmployeeType.TEACHING ? (
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-72">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {teachingSubjects.map((subject) => (
                          <SelectItem key={subject.code} value={subject.code}>
                            {subject.code} - {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  <Button type="button" variant="outline" onClick={() => setIsDateFilterOpen(true)}>
                    <Filter className="h-4 w-4" />
                    {dtrFilterLabel}
                  </Button>

                  {isAdmin ? (
                    <Button
                      type="button"
                      onClick={() => setIsAddTimeOpen(true)}
                      disabled={!canAddTime}
                    >
                      <Plus className="h-4 w-4" />
                      Add Time
                    </Button>
                  ) : null}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setIsCurrentExportOpen(true)}>Export CSV (Current Employee)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsBulkExportOpen(true)}>Bulk Export (All Employee)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>

            <DtrTable
              entries={filteredEntries}
              isHr={isAdmin}
              employeeType={selectedEmployee?.employeeType === 'TEACHING' ? EmployeeType.TEACHING : EmployeeType.NON_TEACHING}
              onEditEntry={(entry) => setEditEntry(entry)}
            />
          </div>
        </div>
      ) : (
        <GraphsPanel
          isHeadHr={isHeadHr}
          campuses={campusOptions}
          graphMode={graphFilter.mode}
          graphMonth={graphFilter.month}
          graphCampus={graphFilter.campus}
          graphEmployeeType={graphEmployeeType}
          data={graphData}
          onChangeMode={(value) => setGraphFilter((current) => ({ ...current, mode: value as GraphFilterMode }))}
          onChangeMonth={(value) => setGraphFilter((current) => ({ ...current, month: value }))}
          onChangeCampus={(value) => setGraphFilter((current) => ({ ...current, campus: value }))}
          onChangeEmployeeType={setGraphEmployeeType}
        />
      )}

      <EditAttendanceDialog
        open={Boolean(editEntry) && isAdmin}
        entry={editEntry}
        employeeType={selectedEmployee?.employeeType === 'TEACHING' ? EmployeeType.TEACHING : EmployeeType.NON_TEACHING}
        classSessions={teachingSessions}
        onClose={() => setEditEntry(null)}
        onSave={applyEditAttendance}
      />

      <AddTimeDialog
        open={isAddTimeOpen && isAdmin}
        employee={selectedEmployee}
        classSessions={teachingSessions}
        onClose={() => setIsAddTimeOpen(false)}
        onAddTime={addTime}
        employeeType={selectedEmployee?.employeeType === EmployeeType.TEACHING ? EmployeeType.TEACHING : EmployeeType.NON_TEACHING}
      />

      <DateFilterDialog
        open={isDateFilterOpen}
        filter={dtrFilter}
        filterLabel={dtrFilterLabel}
        onClose={() => setIsDateFilterOpen(false)}
        onApply={setDtrFilter}
      />

      <ExportDialog
        open={isCurrentExportOpen}
        title="Export Current Employee CSV"
        onClose={() => setIsCurrentExportOpen(false)}
        onExport={exportCurrentCsv}
      />

      <ExportDialog
        open={isBulkExportOpen && isAdmin}
        title="Bulk Export (All Employee)"
        onClose={() => setIsBulkExportOpen(false)}
        onExport={exportBulkCsv}
      />
    </div>
  );
};

export default AdminReports;
