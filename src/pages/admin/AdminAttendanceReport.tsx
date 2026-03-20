import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Plus, Table2, BarChart3, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import EmployeeListPanel from './reports/attendance/components/EmployeeListPanel';
import DtrTable from './reports/attendance/components/DtrTable';
import EditAttendanceDialog from './reports/attendance/components/EditAttendanceDialog';
import AddTimeDialog from './reports/attendance/components/AddTimeDialog';
import ExportDialog from './reports/attendance/components/ExportDialog';
import GraphsPanel from './reports/attendance/components/GraphsPanel';
import DateFilterDialog from './reports/attendance/components/DateFilterDialog';
import { campuses, dtrEntries, reportEmployees } from './reports/attendance/mockData';
import type {
  AddTimeFormValues,
  DtrEntry,
  DtrFilterState,
  ExportRangeMode,
  GraphFilterState,
  GraphFilterMode,
  ReportEmployee,
} from './reports/attendance/types';
import {
  buildGraphData,
  computeLateMinutes,
  computeWorkMinutes,
  downloadCsv,
  filterDtrByRange,
  formatDate,
  formatDateTime,
  formatDuration,
  toCsv,
} from './reports/attendance/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';

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

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const isHr = user?.role === UserRole.HR;

  const [employees] = useState<ReportEmployee[]>(reportEmployees);
  const [entries, setEntries] = useState<DtrEntry[]>(dtrEntries);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(employees[0]?.id ?? null);
  const [dtrFilter, setDtrFilter] = useState<DtrFilterState>(defaultDtrFilter);
  const [graphFilter, setGraphFilter] = useState<GraphFilterState>(defaultGraphFilter);
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

  const selectedEmployee = useMemo(() => {
    return employees.find((employee) => employee.id === selectedEmployeeId) ?? null;
  }, [employees, selectedEmployeeId]);

  const selectedEmployeeEntries = useMemo(() => {
    return entries.filter((entry) => entry.employeeId === selectedEmployeeId);
  }, [entries, selectedEmployeeId]);

  const filteredEntries = useMemo(() => {
    return filterDtrByRange(selectedEmployeeEntries, dtrFilter);
  }, [dtrFilter, selectedEmployeeEntries]);

  const graphData = useMemo(() => {
    return buildGraphData(employees, entries, graphFilter);
  }, [employees, entries, graphFilter]);

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

  const applyEditAttendance = (
    entryId: string,
    payload: Pick<DtrEntry, 'shift' | 'timeIn' | 'timeOut'>,
  ): void => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              shift: payload.shift,
              timeIn: payload.timeIn,
              timeOut: payload.timeOut,
              date: payload.timeIn.slice(0, 10),
            }
          : entry,
      ),
    );
    toast.success('Attendance entry updated.');
  };

  const addTime = (values: AddTimeFormValues): void => {
    const newEntry: DtrEntry = {
      id: `DTR-${Date.now()}`,
      employeeId: values.employeeId,
      date: values.start.slice(0, 10),
      shift: 'Flexible',
      timeIn: values.start,
      timeOut: values.end,
    };

    setEntries((current) => [newEntry, ...current]);
    toast.success(`Time added. Agenda: ${values.agenda || 'N/A'}`);
  };

  const exportCurrentCsv = (mode: ExportRangeMode, month: string, start: string, end: string): void => {
    if (!selectedEmployee) {
      return;
    }

    const filterState: DtrFilterState =
      mode === 'month'
        ? { mode: 'month', month, rangeStart: '', rangeEnd: '' }
        : { mode: 'range', month: '', rangeStart: start, rangeEnd: end };

    const currentEntries = filterDtrByRange(
      entries.filter((entry) => entry.employeeId === selectedEmployee.id),
      filterState,
    );

    const csv = toCsv(
      ['Date', 'Shift', 'Time In', 'Time Out', 'Late', 'Work Hours'],
      currentEntries.map((entry) => [
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
  };

  const exportBulkCsv = (mode: ExportRangeMode, month: string, start: string, end: string): void => {
    const filterState: DtrFilterState =
      mode === 'month'
        ? { mode: 'month', month, rangeStart: '', rangeEnd: '' }
        : { mode: 'range', month: '', rangeStart: start, rangeEnd: end };

    const filtered = filterDtrByRange(entries, filterState);

    const csv = toCsv(
      ['Employee', 'Department', 'Position', 'Date', 'Shift', 'Time In', 'Time Out', 'Late', 'Work Hours'],
      filtered.map((entry) => {
        const employee = employees.find((item) => item.id === entry.employeeId);
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
          />

          <div className="space-y-4">
            <Card>
              <CardHeader className='relative'>
                <CardTitle>DTR Controls</CardTitle>
                <CardDescription>Filter date scope and manage attendance records.</CardDescription>

                <div className="flex flex-wrap gap-2 absolute right-4 top-0">
                  <Button type="button" variant="outline" onClick={() => setIsDateFilterOpen(true)}>
                    <Filter className="h-4 w-4" />
                    {dtrFilterLabel}
                  </Button>

                  {isHr ? (
                    <Button type="button" onClick={() => setIsAddTimeOpen(true)} disabled={!selectedEmployee}>
                      <Plus className="h-4 w-4" />
                      Add Time
                    </Button>
                  ) : null}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger>
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

            <DtrTable entries={filteredEntries} isHr={isHr} onEditEntry={(entry) => setEditEntry(entry)} />
          </div>
        </div>
      ) : (
        <GraphsPanel
          campuses={campuses}
          graphMode={graphFilter.mode}
          graphMonth={graphFilter.month}
          graphCampus={graphFilter.campus}
          data={graphData}
          onChangeMode={(value) => setGraphFilter((current) => ({ ...current, mode: value as GraphFilterMode }))}
          onChangeMonth={(value) => setGraphFilter((current) => ({ ...current, month: value }))}
          onChangeCampus={(value) => setGraphFilter((current) => ({ ...current, campus: value }))}
        />
      )}

      <EditAttendanceDialog
        open={Boolean(editEntry) && isHr}
        entry={editEntry}
        onClose={() => setEditEntry(null)}
        onSave={applyEditAttendance}
      />

      <AddTimeDialog
        open={isAddTimeOpen && isHr}
        employee={selectedEmployee}
        onClose={() => setIsAddTimeOpen(false)}
        onAddTime={addTime}
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
        open={isBulkExportOpen && isHr}
        title="Bulk Export (All Employee)"
        onClose={() => setIsBulkExportOpen(false)}
        onExport={exportBulkCsv}
      />
    </div>
  );
};

export default AdminReports;
