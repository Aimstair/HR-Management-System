import React, { useMemo, useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../../../components/ui/dropdown-menu';
import { Progress } from '../../../../../../components/ui/progress';
import { leaveRecords as initialLeaveRecords, reportEmployees } from '../mockData';
import type { LeaveRecord, ScopeFilterState } from '../types';
import { formatDate, formatDateTime, isInScope } from '../utils';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import AddLeaveDialog from '../components/leave/AddLeaveDialog';

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

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const currentRows = useMemo(() => {
    return leave.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.filedAt, scope));
  }, [leave, scope, selectedEmployeeId]);

  const addLeave = (row: LeaveRecord): void => {
    setLeave((current) => [row, ...current]);
    toast.success('Leave filing added.');
  };

  const updateLeave = (rowId: string, next: Partial<LeaveRecord>): void => {
    setLeave((current) => current.map((item) => (item.id === rowId ? { ...item, ...next } : item)));
  };

  return (
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

      <Card className="h-[calc(100vh-220px)] min-h-[640px]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Leave Report</CardTitle>
              <CardDescription>
                {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.position})` : 'Select employee'}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddOpen(true)} disabled={!selectedEmployee}>
              <Plus className="h-4 w-4" />
              Add Leave
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                render: (row) => <span className="max-w-[160px] truncate block">{row.notes}</span>,
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

          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Leave Volume Snapshot</p>
            <Progress value={Math.min((currentRows.length / 10) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

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
