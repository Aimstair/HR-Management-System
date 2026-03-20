import React, { useMemo, useState } from 'react';
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
import { leaveRecords as initialLeaveRecords, reportEmployees } from '../mockData';
import type { LeaveRecord, ScopeFilterState } from '../types';
import { formatDate, formatDateTime, formatReportRangeTitle, isInScope } from '../utils';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import AddLeaveDialog from '../components/leave/AddLeaveDialog';
import LeaveGraphsPanel from '../components/leave/LeaveGraphsPanel';
import ViewModeHeaderToggle from '../components/common/ViewModeHeaderToggle';

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const LeaveReportPage: React.FC = () => {
  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reportEmployees[0]?.id || null);
  const [leave, setLeave] = useState<LeaveRecord[]>(initialLeaveRecords);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [graphYear, setGraphYear] = useState<string>(String(new Date().getFullYear()));

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const currentRows = useMemo(() => {
    return leave.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.filedAt, scope));
  }, [leave, scope, selectedEmployeeId]);

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, 'Leave Report'), [scope]);

  const years = useMemo(() => {
    const unique = new Set(leave.map((item) => String(new Date(item.filedAt).getFullYear())));
    return Array.from(unique).sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10));
  }, [leave]);

  const leaveRowsByYear = useMemo(() => {
    return leave.filter((item) => new Date(item.filedAt).getFullYear() === Number.parseInt(graphYear, 10));
  }, [leave, graphYear]);

  const employeeMap = useMemo(() => {
    return new Map(reportEmployees.map((employee) => [employee.id, employee]));
  }, []);

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

    return Array.from(aggregate.values()).slice(0, 12);
  }, [leaveRowsByYear, employeeMap]);

  const leaveDateSummary = useMemo(() => {
    const grouped = new Map<string, LeaveRecord[]>();

    leaveRowsByYear.forEach((item) => {
      const current = grouped.get(item.startDate) || [];
      current.push(item);
      grouped.set(item.startDate, current);
    });

    return Array.from(grouped.entries())
      .map(([date, rows]) => ({
        date: formatDate(date),
        count: rows.length,
        employees: rows.map((row) => {
          const employee = employeeMap.get(row.employeeId);
          return {
            id: row.id,
            name: employee?.fullName || 'Unknown',
            avatarUrl: employee?.avatarUrl || 'https://picsum.photos/seed/default-employee/80/80',
            leaveType: row.leaveType,
            dateRange: `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
            notes: row.notes,
          };
        }),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [leaveRowsByYear, employeeMap]);

  const addLeave = (row: LeaveRecord): void => {
    setLeave((current) => [row, ...current]);
    toast.success('Leave filing added.');
  };

  const updateLeave = (rowId: string, next: Partial<LeaveRecord>): void => {
    setLeave((current) => current.map((item) => (item.id === rowId ? { ...item, ...next } : item)));
  };

  return (
    <div className="space-y-4">
      <ViewModeHeaderToggle mode={viewMode} onChangeMode={setViewMode} />

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
          <EmployeeListPanel
            title="Leave Report Employees"
            metricLabel="Leave Filed"
            employees={reportEmployees}
            selectedEmployeeId={selectedEmployeeId}
            scope={scope}
            onSelectEmployee={setSelectedEmployeeId}
            onScopeChange={setScope}
            onOpenScopeModal={() => setIsScopeOpen(true)}
            metricBuilder={(employee) => String(employee.leaveFiledCount)}
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
                  <Button onClick={() => setIsAddOpen(true)} disabled={!selectedEmployee}>
                    <Plus className="h-4 w-4" />
                    Add Leave
                  </Button>
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
                              updateLeave(row.id, { status: 'Cancelled', remarks: 'Cancelled by HR.' });
                              toast.success('Leave cancelled.');
                            }}
                          >
                            Cancel Leave
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              updateLeave(row.id, { remarks: 'Flagged as uncredited.' });
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
          year={graphYear}
          years={years}
          onChangeYear={setGraphYear}
          monthlyCountData={monthlyCountData}
          leaveByTypeData={leaveByTypeData}
          leaveByDepartmentData={leaveByDepartmentData}
          leaveByEmployeeData={leaveByEmployeeData}
          leaveDateSummary={leaveDateSummary}
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
        relieverOptions={reportEmployees}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addLeave}
      />
    </div>
  );
};

export default LeaveReportPage;
