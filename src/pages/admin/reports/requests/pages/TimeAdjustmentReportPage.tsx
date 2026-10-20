import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import AddTimeAdjustmentDialog from '../components/time-adjustment/AddTimeAdjustmentDialog';
import type { ReportEmployeeSummary, ScopeFilterState, TimeAdjustmentRecord } from '../types';
import { formatDateTime, formatReportRangeTitle, isInScope } from '../utils';
import { fetchReportEmployees, fetchReportRequests, mapRequestStatusToReportStatus, toProcessorInfo } from '../report-api';
import { createAdminRequest, type AdminRequestRecord } from '../../../../../lib/admin-api';

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const TimeAdjustmentReportPage: React.FC = () => {
  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<ReportEmployeeSummary[]>([]);
  const [requests, setRequests] = useState<AdminRequestRecord[]>([]);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;

    const load = async (): Promise<void> => {
      try {
        const [employeeRows, requestRows] = await Promise.all([
          fetchReportEmployees(),
          fetchReportRequests('TIME_ADJUSTMENT'),
        ]);
        if (!isActive) {
          return;
        }
        setEmployees(employeeRows);
        setRequests(requestRows);
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : 'Unable to load time adjustment reports.';
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

  const timeAdjustmentRecords = useMemo<TimeAdjustmentRecord[]>(() => {
    return requests.map((request) => ({
      id: request.id,
      employeeId: request.employeeId,
      requestedAt: request.createdAt,
      specifiedTimeIn: request.leaveStartDate ?? request.createdAt,
      specifiedTimeOut: request.leaveEndDate ?? request.createdAt,
      actualTimeOut: request.leaveEndDate ?? request.createdAt,
      notes: request.description ?? request.title,
      status: mapRequestStatusToReportStatus(request.status),
      processedBy: toProcessorInfo(request.reviewedBy),
    }));
  }, [requests]);

  const rows = useMemo(
    () => timeAdjustmentRecords.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.requestedAt, scope)),
    [scope, selectedEmployeeId, timeAdjustmentRecords],
  );

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, 'Time Adjustment Report'), [scope]);

  const addTimeAdjustment = async (record: TimeAdjustmentRecord): Promise<void> => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await createAdminRequest({
        type: 'TIME_ADJUSTMENT',
        employeeId: record.employeeId,
        title: 'Time Adjustment',
        description: record.notes.trim() ? record.notes.trim() : null,
        leaveStartDate: record.specifiedTimeIn,
        leaveEndDate: record.specifiedTimeOut,
      });

      setRequests((current) => [
        response.request,
        ...current.filter((item) => item.id !== response.request.id),
      ]);
      toast.success('Time adjustment request created.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create time adjustment request.';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <EmployeeListPanel
        title="Time Adjustment Employees"
        metricLabel="Adjustment Count"
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        scope={scope}
        onSelectEmployee={setSelectedEmployeeId}
        onScopeChange={setScope}
        onOpenScopeModal={() => setIsScopeOpen(true)}
        metricBuilder={(employee) =>
          String(timeAdjustmentRecords.filter((item) => item.employeeId === employee.id && isInScope(item.requestedAt, scope)).length)
        }
        exportRowsBuilder={(employeeId) => {
          const employeeRows = timeAdjustmentRecords.filter((item) => item.employeeId === employeeId);
          return employeeRows.map((item) => [
            formatDateTime(item.requestedAt),
            formatDateTime(item.specifiedTimeIn),
            formatDateTime(item.specifiedTimeOut),
            formatDateTime(item.actualTimeOut),
            item.notes,
            item.status,
          ]);
        }}
      />

      <div className="flex flex-col gap-4">
        <Card>
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
                Add Adjustment
              </Button> */}
            </div>
          </CardHeader>
        </Card>

        <Card className="h-[calc(100vh-230px)] p-0 gap-0">
          <GenericReportTable
            rows={rows}
            emptyMessage="No time adjustment records for selected employee and filter."
            columns={[
              { id: 'requestedAt', label: 'Date Requested', render: (row) => formatDateTime(row.requestedAt) },
              { id: 'specifiedTimeIn', label: 'Specified Time In', render: (row) => formatDateTime(row.specifiedTimeIn) },
              { id: 'specifiedTimeOut', label: 'Specified Time Out', render: (row) => formatDateTime(row.specifiedTimeOut) },
              { id: 'actualTimeOut', label: 'Actual Time Out', render: (row) => formatDateTime(row.actualTimeOut) },
              { id: 'notes', label: 'Notes', render: (row) => <span className="max-w-56 block truncate">{row.notes}</span> },
              { id: 'status', label: 'Status', render: (row) => <Badge variant="outline">{row.status}</Badge> },
              { id: 'processedBy', label: 'Processed By', render: (row) => <ProcessorAvatar processor={row.processedBy} /> },
            ]}
          />
        </Card>
      </div>

      <ScopeFilterDialog
        open={isScopeOpen}
        mode={scope.mode === 'today' || scope.mode === 'last30' ? 'month' : scope.mode}
        value={scope}
        onClose={() => setIsScopeOpen(false)}
        onApply={setScope}
      />

      <AddTimeAdjustmentDialog
        open={isAddOpen}
        employee={selectedEmployee}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addTimeAdjustment}
      />
    </div>
  );
};

export default TimeAdjustmentReportPage;
