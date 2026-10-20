import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../../../components/ui/dropdown-menu';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import { useAuth } from '../../../../../context/AuthContext';
import ViewModeHeaderToggle from '../components/common/ViewModeHeaderToggle';
import AddOvertimeDialog from '../components/overtime/AddOvertimeDialog';
import OvertimeGraphsPanel from '../components/overtime/OvertimeGraphsPanel';
import { createAdminRequest, updateAdminRequestStatus, type AdminRequestRecord } from '../../../../../lib/admin-api';
import type { OvertimeRecord, ReportEmployeeSummary, ScopeFilterState } from '../types';
import type { GraphFilterState, GraphFilterMode } from '../attendance/types';
import {
  formatDateTime,
  formatHours,
  formatReportRangeTitle,
  getDurationHours,
  isInScope,
  isGraphInScope,
} from '../utils';
import { fetchReportEmployees, fetchReportRequests, mapRequestStatusToReportStatus, toProcessorInfo } from '../report-api';

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const defaultGraphFilter: GraphFilterState = {
  mode: 'last30',
  month: '',
  campus: 'all',
};

const OvertimeReportPage: React.FC = () => {
  const { user } = useAuth();
  const isHeadHr = user?.role === 'ROLE_HEAD_HR';

  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<ReportEmployeeSummary[]>([]);
  const [requests, setRequests] = useState<AdminRequestRecord[]>([]);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [graphFilter, setGraphFilter] = useState<GraphFilterState>(defaultGraphFilter);

  useEffect(() => {
    let isActive = true;

    const load = async (): Promise<void> => {
      try {
        const [employeeRows, requestRows] = await Promise.all([
          fetchReportEmployees(),
          fetchReportRequests('OVERTIME'),
        ]);
        if (!isActive) {
          return;
        }
        setEmployees(employeeRows);
        setRequests(requestRows);
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : 'Unable to load overtime reports.';
          toast.error(message);
          setEmployees([]);
          setRequests([]);
        }
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!employees.length) {
      setSelectedEmployeeId(null);
      return;
    }

    const stillVisible = employees.some((employee) => employee.id === selectedEmployeeId);
    if (!stillVisible) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) || null,
    [employees, selectedEmployeeId],
  );

  const rows = useMemo<OvertimeRecord[]>(() => {
    return requests.map((request) => ({
      id: request.id,
      employeeId: request.employeeId,
      requestedAt: request.createdAt,
      overtimeStart: request.leaveStartDate ?? request.createdAt,
      overtimeEnd: request.leaveEndDate ?? request.createdAt,
      tasksDone: request.title,
      notes: request.description ?? request.title,
      status: mapRequestStatusToReportStatus(request.status),
      processedBy: toProcessorInfo(request.reviewedBy),
    }));
  }, [requests]);

  const filteredRows = useMemo(
    () => rows.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.requestedAt, scope)),
    [rows, scope, selectedEmployeeId],
  );

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, 'Overtime Report'), [scope]);

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

  const filteredByYear = useMemo(() => {
    const campusFilteredEmployees =
      graphFilter.campus === 'all'
        ? employees
        : employees.filter((employee) => (employee.campusId ?? employee.campus) === graphFilter.campus);

    const allowedIds = new Set(campusFilteredEmployees.map((employee) => employee.id));
    return rows.filter((item) => allowedIds.has(item.employeeId) && isGraphInScope(item.requestedAt, graphFilter));
  }, [rows, graphFilter, employees]);

  const employeeMap = useMemo(() => {
    return new Map(employees.map((employee) => [employee.id, employee]));
  }, [employees]);

  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    filteredByYear.forEach((item) => {
      const month = new Date(item.requestedAt).getMonth();
      counts[month] += 1;
    });

    return monthNames.map((month, index) => ({ month, count: counts[index] }));
  }, [filteredByYear]);

  const departmentCountData = useMemo(() => {
    const aggregate = new Map<string, number>();

    filteredByYear.forEach((item) => {
      const department = employeeMap.get(item.employeeId)?.department || 'Unknown';
      aggregate.set(department, (aggregate.get(department) || 0) + 1);
    });

    return Array.from(aggregate.entries()).map(([department, count]) => ({ department, count }));
  }, [filteredByYear, employeeMap]);

  const departmentDurationData = useMemo(() => {
    const aggregate = new Map<string, { totalHours: number; count: number }>();

    filteredByYear.forEach((item) => {
      const department = employeeMap.get(item.employeeId)?.department || 'Unknown';
      const duration = getDurationHours(item.overtimeStart, item.overtimeEnd);
      const current = aggregate.get(department) || { totalHours: 0, count: 0 };
      aggregate.set(department, {
        totalHours: current.totalHours + duration,
        count: current.count + 1,
      });
    });

    return Array.from(aggregate.entries()).map(([department, value]) => ({
      department,
      totalHours: Number(value.totalHours.toFixed(2)),
      averageHours: Number((value.totalHours / Math.max(value.count, 1)).toFixed(2)),
    }));
  }, [filteredByYear, employeeMap]);

  const employeeDurationCountData = useMemo(() => {
    const aggregate = new Map<string, { employeeName: string; count: number; totalHours: number }>();

    filteredByYear.forEach((item) => {
      const employeeName = employeeMap.get(item.employeeId)?.fullName || 'Unknown';
      const key = item.employeeId;
      const current = aggregate.get(key) || { employeeName, count: 0, totalHours: 0 };
      aggregate.set(key, {
        employeeName,
        count: current.count + 1,
        totalHours: current.totalHours + getDurationHours(item.overtimeStart, item.overtimeEnd),
      });
    });

    return Array.from(aggregate.values())
      .map((item) => ({ ...item, totalHours: Number(item.totalHours.toFixed(2)) }))
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 10);
  }, [filteredByYear, employeeMap]);

  const cancelOvertime = useCallback(
    async (rowId: string): Promise<void> => {
      try {
        const response = await updateAdminRequestStatus(rowId, 'CANCELLED', 'Cancelled by HR.');
        setRequests((current) => current.map((item) => (item.id === rowId ? response.request : item)));
        toast.success('Overtime request cancelled.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to cancel overtime request.';
        toast.error(message);
      }
    },
    [],
  );

  const createOvertime = useCallback(
    async (record: OvertimeRecord): Promise<void> => {
      if (isCreating) {
        return;
      }

      setIsCreating(true);

      try {
        const response = await createAdminRequest({
          type: 'OVERTIME',
          employeeId: record.employeeId,
          title: record.tasksDone,
          description: record.notes.trim() ? record.notes.trim() : null,
          leaveStartDate: record.overtimeStart,
          leaveEndDate: record.overtimeEnd,
        });

        setRequests((current) => [
          response.request,
          ...current.filter((item) => item.id !== response.request.id),
        ]);
        toast.success('Overtime request created.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create overtime request.';
        toast.error(message);
      } finally {
        setIsCreating(false);
      }
    },
    [isCreating],
  );

  return (
    <div className="space-y-4">
      <ViewModeHeaderToggle mode={viewMode} onChangeMode={setViewMode} />

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
          <EmployeeListPanel
            title="Overtime Report Employees"
            metricLabel="Overtime Count"
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            scope={scope}
            onSelectEmployee={setSelectedEmployeeId}
            onScopeChange={setScope}
            onOpenScopeModal={() => setIsScopeOpen(true)}
            metricBuilder={(employee) =>
              String(rows.filter((item) => item.employeeId === employee.id && isInScope(item.requestedAt, scope)).length)
            }
            exportRowsBuilder={(employeeId) => {
              const employeeRows = rows.filter((item) => item.employeeId === employeeId);
              return employeeRows.map((item) => [
                formatDateTime(item.requestedAt),
                `${formatDateTime(item.overtimeStart)} - ${formatDateTime(item.overtimeEnd)}`,
                formatHours(getDurationHours(item.overtimeStart, item.overtimeEnd)),
                item.tasksDone,
                item.notes,
                item.status,
              ]);
            }}
          />

          <div className="flex flex-col gap-4">
            <Card  className='pb-4'>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>{reportLabel}</CardTitle>
                    <CardDescription className='text-xl uppercase text-primary font-bold'>
                      {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.position})` : 'Select employee'}
                    </CardDescription>
                  </div>

                  {/* <Button onClick={() => setIsAddOpen(true)} disabled={!selectedEmployee || isCreating}>
                    <Plus className="h-4 w-4" />
                    Add Overtime
                  </Button> */}
                </div>
              </CardHeader>
            </Card>

            <Card className="h-[calc(100vh-230px)] p-0 gap-0">
              <GenericReportTable
                rows={filteredRows}
                emptyMessage="No overtime records for selected employee and filter."
                columns={[
                  { id: 'requestedAt', label: 'Date Requested', render: (row) => formatDateTime(row.requestedAt) },
                  {
                    id: 'otDateTime',
                    label: 'Overtime Datetime',
                    render: (row) => (
                      <div className='flex flex-col gap-1'>
                        <span className="text-xs">
                            <span className='text-[10px]'>From:</span> {formatDateTime(row.overtimeStart)}
                        </span>
                        <span className="text-xs">
                            <span className='text-[10px]'>To:</span> {formatDateTime(row.overtimeEnd)}
                        </span>
                      </div>
                    ),
                  },
                  {
                    id: 'duration',
                    label: 'Overtime Duration',
                    render: (row) => formatHours(getDurationHours(row.overtimeStart, row.overtimeEnd)),
                  },
                  { id: 'tasksDone', label: 'Tasks/Project Done', render: (row) => <span className="max-w-56 block truncate">{row.tasksDone}</span> },
                  { id: 'notes', label: 'Notes', render: (row) => <span className="max-w-56 block truncate">{row.notes}</span> },
                  { id: 'status', label: 'Status', render: (row) => <Badge variant="outline">{row.status}</Badge> },
                  { id: 'processedBy', label: 'Processed By', render: (row) => <ProcessorAvatar processor={row.processedBy} /> },
                  {
                    id: 'action',
                    label: 'Action',
                    render: (row) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => cancelOvertime(row.id)}>Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      ) : (
        <OvertimeGraphsPanel
          isHeadHr={isHeadHr}
          campuses={campusOptions}
          graphMode={graphFilter.mode}
          graphMonth={graphFilter.month}
          graphCampus={graphFilter.campus}
          onChangeMode={(mode) => setGraphFilter((current) => ({ ...current, mode }))}
          onChangeMonth={(month) => setGraphFilter((current) => ({ ...current, month }))}
          onChangeCampus={(campus) => setGraphFilter((current) => ({ ...current, campus }))}
          monthlyData={monthlyData}
          departmentCountData={departmentCountData}
          departmentDurationData={departmentDurationData}
          employeeDurationCountData={employeeDurationCountData}
        />
      )}

      <ScopeFilterDialog
        open={isScopeOpen}
        mode={scope.mode === 'today' || scope.mode === 'last30' ? 'month' : scope.mode}
        value={scope}
        onClose={() => setIsScopeOpen(false)}
        onApply={setScope}
      />

      <AddOvertimeDialog
        open={isAddOpen}
        employee={selectedEmployee}
        onClose={() => setIsAddOpen(false)}
        onSubmit={createOvertime}
      />
    </div>
  );
};

export default OvertimeReportPage;
