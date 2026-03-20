import React, { useMemo, useState } from 'react';
import { Badge } from '../../../../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import { expenseRecords, reportEmployees } from '../mockData';
import type { ScopeFilterState } from '../types';
import { formatCurrency, formatDateTime, isInScope } from '../utils';

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const ExpenseReportPage: React.FC = () => {
  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reportEmployees[0]?.id || null);

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const rows = useMemo(
    () => expenseRecords.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.incurredAt, scope)),
    [scope, selectedEmployeeId],
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <EmployeeListPanel
        title="Expense Report Employees"
        metricLabel="Total Amount"
        employees={reportEmployees}
        selectedEmployeeId={selectedEmployeeId}
        scope={scope}
        onSelectEmployee={setSelectedEmployeeId}
        onScopeChange={setScope}
        onOpenScopeModal={() => setIsScopeOpen(true)}
        metricBuilder={(employee) => formatCurrency(employee.expenseTotal)}
        exportRowsBuilder={(employeeId) => {
          const employeeRows = expenseRecords.filter((item) => item.employeeId === employeeId);
          return employeeRows.map((item) => [
            item.type,
            formatDateTime(item.incurredAt),
            item.notes,
            String(item.amount),
            item.status,
          ]);
        }}
      />

      <Card className="h-[calc(100vh-220px)] min-h-[640px]">
        <CardHeader>
          <CardTitle>Expense Report</CardTitle>
          <CardDescription>
            {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.position})` : 'Select employee'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericReportTable
            rows={rows}
            emptyMessage="No expense records for selected employee and filter."
            columns={[
              { id: 'type', label: 'Type', render: (row) => row.type },
              { id: 'incurredAt', label: 'Date Incurred', render: (row) => formatDateTime(row.incurredAt) },
              { id: 'notes', label: 'Notes', render: (row) => <span className="max-w-[220px] truncate block">{row.notes}</span> },
              { id: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
              { id: 'status', label: 'Status', render: (row) => <Badge variant="outline">{row.status}</Badge> },
              { id: 'processedBy', label: 'Processed By', render: (row) => <ProcessorAvatar processor={row.processedBy} /> },
            ]}
          />
        </CardContent>
      </Card>

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

export default ExpenseReportPage;
