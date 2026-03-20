import React, { useMemo, useState } from 'react';
import { Badge } from '../../../../../../components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import { reportEmployees, timeAdjustmentRecords } from '../mockData';
import type { ScopeFilterState } from '../types';
import { formatDateTime, formatReportRangeTitle, isInScope } from '../utils';

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reportEmployees[0]?.id || null);

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const rows = useMemo(
    () => timeAdjustmentRecords.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.requestedAt, scope)),
    [scope, selectedEmployeeId],
  );

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, 'Time Adjustment Report'), [scope]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <EmployeeListPanel
        title="Time Adjustment Employees"
        metricLabel="Adjustment Count"
        employees={reportEmployees}
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
          <CardHeader className='gap-0'>
            <CardTitle>{reportLabel}</CardTitle>
            <CardDescription className='text-xl uppercase text-primary font-bold'>
              {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.position})` : 'Select employee'}
            </CardDescription>
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
    </div>
  );
};

export default TimeAdjustmentReportPage;
