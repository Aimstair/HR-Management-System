import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import AddUndertimeDialog from '../components/undertime/AddUndertimeDialog';
import { reportEmployees, undertimeRecords as initialRows } from '../mockData';
import type { ScopeFilterState, UndertimeRecord } from '../types';
import { formatDateTime, formatReportRangeTitle, isInScope } from '../utils';

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const UndertimeReportPage: React.FC = () => {
  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [rows, setRows] = useState<UndertimeRecord[]>(initialRows);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reportEmployees[0]?.id || null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const currentRows = useMemo(
    () => rows.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.requestedAt, scope)),
    [rows, scope, selectedEmployeeId],
  );

  const reportLabel = useMemo(() => formatReportRangeTitle(scope, 'Undertime Report'), [scope]);

  const addUndertime = (row: UndertimeRecord): void => {
    setRows((current) => [row, ...current]);
    toast.success('Undertime request added.');
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <EmployeeListPanel
        title="Undertime Report Employees"
        metricLabel="Undertime Count"
        employees={reportEmployees}
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
            formatDateTime(item.specifiedDateTime),
            item.notes,
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
                Add Undertime
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="h-[calc(100vh-230px)] p-0 gap-0">
          <GenericReportTable
            rows={currentRows}
            emptyMessage="No undertime records for selected employee and filter."
            columns={[
              { id: 'requestedAt', label: 'Date Requested', render: (row) => formatDateTime(row.requestedAt) },
              { id: 'specifiedDateTime', label: 'Specified Date Time', render: (row) => formatDateTime(row.specifiedDateTime) },
              { id: 'notes', label: 'Notes', render: (row) => <span className="max-w-64 block truncate">{row.notes}</span> },
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

      <AddUndertimeDialog
        open={isAddOpen}
        employee={selectedEmployee}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addUndertime}
      />
    </div>
  );
};

export default UndertimeReportPage;
