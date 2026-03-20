import React, { useMemo, useState } from 'react';
import { Badge } from '../../../../../../components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import { reportEmployees } from '../mockData';
import type { GenericRequestRecord, ScopeFilterState } from '../types';
import { formatDateTime, formatReportRangeTitle, isInScope } from '../utils';

interface GenericRequestReportPageProps {
  title: string;
  description: string;
  rows: GenericRequestRecord[];
}

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const GenericRequestReportPage: React.FC<GenericRequestReportPageProps> = ({ title, description, rows }) => {
  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reportEmployees[0]?.id || null);

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const currentRows = useMemo(
    () => rows.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.filedAt, scope)),
    [rows, scope, selectedEmployeeId],
  );

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, title), [scope, title]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <EmployeeListPanel
        title={`${title} Employees`}
        metricLabel="Records"
        employees={reportEmployees}
        selectedEmployeeId={selectedEmployeeId}
        scope={scope}
        onSelectEmployee={setSelectedEmployeeId}
        onScopeChange={setScope}
        onOpenScopeModal={() => setIsScopeOpen(true)}
        metricBuilder={() => String(currentRows.length)}
        exportRowsBuilder={(employeeId) => {
          const employeeRows = rows.filter((item) => item.employeeId === employeeId);
          return employeeRows.map((item) => [item.type, formatDateTime(item.filedAt), item.details, item.status]);
        }}
      />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description} {selectedEmployee ? `- ${selectedEmployee.fullName}` : ''}</CardDescription>
            <CardDescription>{reportLabel}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="h-[calc(100vh-230px)] p-0 gap-0">
          <GenericReportTable
            rows={currentRows}
            emptyMessage={`No ${title.toLowerCase()} records for selected employee and filter.`}
            columns={[
              { id: 'type', label: 'Type', render: (row) => row.type },
              { id: 'filedAt', label: 'Date Filed', render: (row) => formatDateTime(row.filedAt) },
              { id: 'details', label: 'Details', render: (row) => <span className="max-w-70 block truncate">{row.details}</span> },
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

export default GenericRequestReportPage;
