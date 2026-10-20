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
import { updateAdminRequestStatus, type AdminRequestRecord } from '../../../../../lib/admin-api';
import type { LeaveRecord, ReportEmployeeSummary, ScopeFilterState } from '../types';
import type { GraphFilterState, GraphFilterMode } from '../attendance/types';
import { formatDate, formatDateTime, formatReportRangeTitle, isInScope, isGraphInScope } from '../utils';
import { fetchReportEmployees, fetchReportRequests, mapRequestStatusToReportStatus, toProcessorInfo } from '../report-api';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import AddLeaveDialog from '../components/leave/AddLeaveDialog';
import LeaveGraphsPanel from '../components/leave/LeaveGraphsPanel';
import { useAuth } from '../../../../../context/AuthContext';
import ViewModeHeaderToggle from '../components/common/ViewModeHeaderToggle';

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

const LeaveReportPage: React.FC = () => {
  const { user } = useAuth();
  const isHeadHr = user?.role === 'ROLE_HEAD_HR';

  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<ReportEmployeeSummary[]>([]);
  const [requests, setRequests] = useState<AdminRequestRecord[]>([]);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [graphFilter, setGraphFilter] = useState<GraphFilterState>(defaultGraphFilter);

  useEffect(() => {
    let isActive = true;

    const load = async (): Promise<void> => {
      try {
        const [employeeRows, requestRows] = await Promise.all([
          fetchReportEmployees(),
          fetchReportRequests('LEAVE'),
        ]);
        if (!isActive) {
          return;
        }
        setEmployees(employeeRows);
        setRequests(requestRows);
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : 'Unable to load leave reports.';
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

  const leave = useMemo<LeaveRecord[]>(() => {
    return requests.map((request) => {
      const startDate = request.leaveStartDate?.slice(0, 10) ?? request.createdAt.slice(0, 10);
      const endDate = request.leaveEndDate?.slice(0, 10) ?? startDate;
      const duration = request.leaveStartDate && request.leaveEndDate
        ? `${Math.max(1, Math.ceil((
            new Date(request.leaveEndDate).getTime() - new Date(request.leaveStartDate).getTime()
          ) / (1000 * 60 * 60 * 24)))} day(s)`
        : 'N/A';

      return {
        id: request.id,
        employeeId: request.employeeId,
        filedAt: request.createdAt,
        leaveType: 'Others',
        startDate,
        endDate,
        duration,
        notes: request.description ?? request.title,
        paid: false,
        status: mapRequestStatusToReportStatus(request.status),
        reliever: 'N/A',
        remarks: request.remarks ?? '—',
        processedBy: toProcessorInfo(request.reviewedBy),
      };
    });
  }, [requests]);

  const currentRows = useMemo(() => {
    return leave.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.filedAt, scope));
  }, [leave, scope, selectedEmployeeId]);

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, 'Leave Report'), [scope]);

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

  const leaveRowsByYear = useMemo(() => {
    const campusFilteredEmployees =
      graphFilter.campus === 'all'
        ? employees
        : employees.filter((employee) => (employee.campusId ?? employee.campus) === graphFilter.campus);

    const allowedIds = new Set(campusFilteredEmployees.map((employee) => employee.id));
    return leave.filter((item) => allowedIds.has(item.employeeId) && isGraphInScope(item.filedAt, graphFilter));
  }, [leave, graphFilter, employees]);

  const employeeMap = useMemo(() => {
    return new Map(employees.map((employee) => [employee.id, employee]));
  }, [employees]);

  const monthlyCountData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    leaveRowsByYear.forEach((item) => {
      counts[new Date(item.filedAt).getMonth()] += 1;
    });

    return monthNames.map((month, index) => ({ month, count: counts[index] }));
  }, [leaveRowsByYear]);

  const leaveByTypeData = useMemo(() => {
    const aggregate = new Map<string, number>();

    leaveRowsByYear.forEach((item) => {
      aggregate.set(item.leaveType, (aggregate.get(item.leaveType) || 0) + 1);
    });

    return Array.from(aggregate.entries()).map(([type, count]) => ({ type, count }));
  }, [leaveRowsByYear]);

  const leaveByDepartmentData = useMemo(() => {
    const aggregate = new Map<string, number>();

    leaveRowsByYear.forEach((item) => {
      const department = employeeMap.get(item.employeeId)?.department || 'Unknown';
      aggregate.set(department, (aggregate.get(department) || 0) + 1);
    });

    return Array.from(aggregate.entries()).map(([department, count]) => ({ department, count }));
  }, [leaveRowsByYear, employeeMap]);

  const leaveByEmployeeData = useMemo(() => {
    const aggregate = new Map<string, { employeeName: string; Vacation: number; Sick: number; Emergency: number; Others: number }>();

    leaveRowsByYear.forEach((item) => {
      const employeeName = employeeMap.get(item.employeeId)?.fullName || 'Unknown';
      const current = aggregate.get(item.employeeId) || {
        employeeName,
        Vacation: 0,
        Sick: 0,
        Emergency: 0,
        Others: 0,
      };

      if (item.leaveType === 'Vacation') {
        current.Vacation += 1;
      } else if (item.leaveType === 'Sick') {
        current.Sick += 1;
      } else if (item.leaveType === 'Emergency') {
        current.Emergency += 1;
      } else {
        current.Others += 1;
      }

      aggregate.set(item.employeeId, current);
    });

    return Array.from(aggregate.values())
      .sort((a, b) => {
        const totalA = a.Vacation + a.Sick + a.Emergency + a.Others;
        const totalB = b.Vacation + b.Sick + b.Emergency + b.Others;
        return totalB - totalA;
      })
      .slice(0, 10);
  }, [leaveRowsByYear, employeeMap]);

  const leaveList = useMemo(() => {
    return leaveRowsByYear
      .filter((row) => row.status === 'Approved')
      .map((row) => {
      const employee = employeeMap.get(row.employeeId);
      return {
        id: row.id,
        name: employee?.fullName || 'Unknown',
        avatarUrl: employee?.avatarUrl || 'https://picsum.photos/seed/default-employee/80/80',
        leaveType: row.leaveType,
        startDate: row.startDate,
        endDate: row.endDate,
        dateRange: `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
        notes: row.notes,
      };
    }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [leaveRowsByYear, employeeMap]);

  const updateLeave = useCallback(
    async (rowId: string, status: AdminRequestRecord['status'], remarks?: string) => {
      try {
        const response = await updateAdminRequestStatus(rowId, status, remarks ?? null);
        setRequests((current) => current.map((item) => (item.id === rowId ? response.request : item)));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update leave request.';
        toast.error(message);
      }
    },
    [],
  );

  return (
    <div className="space-y-4">
      <ViewModeHeaderToggle mode={viewMode} onChangeMode={setViewMode} />

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
          <EmployeeListPanel
            title="Leave Report Employees"
            metricLabel="Leave Filed"
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            scope={scope}
            onSelectEmployee={setSelectedEmployeeId}
            onScopeChange={setScope}
            onOpenScopeModal={() => setIsScopeOpen(true)}
            metricBuilder={(employee) =>
              String(leave.filter((item) => item.employeeId === employee.id && isInScope(item.filedAt, scope)).length)
            }
            exportRowsBuilder={(employeeId) => {
              const rows = leave.filter((item) => item.employeeId === employeeId);
              return rows.map((item) => [
                item.id,
                formatDateTime(item.filedAt),
                item.leaveType,
                `${item.startDate} - ${item.endDate}`,
                item.duration,
                item.status,
              ]);
            }}
          />

          <div className="flex flex-col gap-4">
            <Card className='pb-4'>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>{reportLabel}</CardTitle>
                    <CardDescription className='text-xl uppercase text-primary font-bold'>
                      {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.position})` : 'Select employee'}
                    </CardDescription>
                  </div>
                  {/* <Button onClick={() => setIsAddOpen(true)} disabled={!selectedEmployee}>
                    <Plus className="h-4 w-4" />
                    Add Leave
                  </Button> */}
                </div>
              </CardHeader>
            </Card>

            <Card className="h-[calc(100vh-230px)] p-0 gap-0">
              <GenericReportTable
                rows={currentRows}
                emptyMessage="No leave records for selected employee and filter."
                columns={[
                  {
                    id: 'filedAt',
                    label: 'Date Filed',
                    render: (row) => <span className="text-sm">{formatDateTime(row.filedAt)}</span>,
                  },
                  {
                    id: 'type',
                    label: 'Type',
                    render: (row) => (
                      <div className="text-sm">
                        <p className="font-medium">{row.leaveType}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(row.startDate)} - {formatDate(row.endDate)}</p>
                      </div>
                    ),
                  },
                  {
                    id: 'duration',
                    label: 'Duration',
                    render: (row) => row.duration,
                  },
                  {
                    id: 'notes',
                    label: 'Notes',
                    render: (row) => <span className="max-w-40 truncate block">{row.notes}</span>,
                  },
                  {
                    id: 'paid',
                    label: 'Paid',
                    render: (row) => (row.paid ? 'Yes' : 'No'),
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    render: (row) => <Badge variant="outline">{row.status}</Badge>,
                  },
                  {
                    id: 'reliever',
                    label: 'Reliever',
                    render: (row) => row.reliever,
                  },
                  {
                    id: 'remarks',
                    label: 'Remarks',
                    render: (row) => row.remarks,
                  },
                  {
                    id: 'processedBy',
                    label: 'Processed By',
                    render: (row) => <ProcessorAvatar processor={row.processedBy} />,
                  },
                  {
                    id: 'actions',
                    label: 'Actions',
                    render: (row) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              updateLeave(row.id, 'CANCELLED', 'Cancelled by HR.');
                              toast.success('Leave cancelled.');
                            }}
                          >
                            Cancel Leave
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const existing = requests.find((item) => item.id === row.id);
                              if (existing) {
                                updateLeave(row.id, existing.status, 'Flagged as uncredited.');
                                toast.success('Leave flagged as uncredited.');
                                return;
                              }
                              toast.success('Leave flagged as uncredited.');
                            }}
                          >
                            Flag as Uncredited
                          </DropdownMenuItem>
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
        <LeaveGraphsPanel
          isHeadHr={isHeadHr}
          campuses={campusOptions}
          graphMode={graphFilter.mode}
          graphMonth={graphFilter.month}
          graphCampus={graphFilter.campus}
          onChangeMode={(mode) => setGraphFilter((current) => ({ ...current, mode }))}
          onChangeMonth={(month) => setGraphFilter((current) => ({ ...current, month }))}
          onChangeCampus={(campus) => setGraphFilter((current) => ({ ...current, campus }))}
          monthlyCountData={monthlyCountData}
          leaveByTypeData={leaveByTypeData}
          leaveByDepartmentData={leaveByDepartmentData}
          leaveByEmployeeData={leaveByEmployeeData}
          leaveList={leaveList}
        />
      )}

      <ScopeFilterDialog
        open={isScopeOpen}
        mode={scope.mode === 'today' || scope.mode === 'last30' ? 'month' : scope.mode}
        value={scope}
        onClose={() => setIsScopeOpen(false)}
        onApply={setScope}
      />

      <AddLeaveDialog
        open={isAddOpen}
        employee={selectedEmployee}
        relieverOptions={employees}
        onClose={() => setIsAddOpen(false)}
        onSubmit={() => toast.info('Create leave requests from the employee portal.')}
      />
    </div>
  );
};

export default LeaveReportPage;
