import React, { useMemo, useState } from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../../components/ui/avatar';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Input } from '../../../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';
import type { ReportEmployeeSummary, ScopeFilterState } from '../types';
import { downloadCsv, paginate } from '../utils';
import Paginator from './Paginator';

interface EmployeeListPanelProps {
  title: string;
  metricLabel: string;
  secondaryMetricLabel?: string;
  employees: ReportEmployeeSummary[];
  selectedEmployeeId: string | null;
  scope: ScopeFilterState;
  onSelectEmployee: (employeeId: string) => void;
  onScopeChange: (next: ScopeFilterState) => void;
  onOpenScopeModal: () => void;
  metricBuilder: (employee: ReportEmployeeSummary) => string;
  secondaryMetricBuilder?: (employee: ReportEmployeeSummary) => string;
  exportRowsBuilder: (employeeId: string) => string[][];
}

const PAGE_SIZE = 8;

const EmployeeListPanel: React.FC<EmployeeListPanelProps> = ({
  title,
  metricLabel,
  secondaryMetricLabel,
  employees,
  selectedEmployeeId,
  scope,
  onSelectEmployee,
  onScopeChange,
  onOpenScopeModal,
  metricBuilder,
  secondaryMetricBuilder,
  exportRowsBuilder,
}) => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return employees;
    }
    return employees.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(query) || employee.position.toLowerCase().includes(query),
    );
  }, [employees, search]);

  const { rows, totalPages, safePage } = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);

  React.useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const scopeLabel = useMemo(() => {
    if (scope.mode === 'today') {
      return 'Today';
    }
    if (scope.mode === 'last30') {
      return 'Last 30 Days';
    }
    if (scope.mode === 'month') {
      const month = Number.parseInt(scope.month, 10);
      const year = Number.parseInt(scope.year, 10);
      if (!Number.isNaN(month) && !Number.isNaN(year)) {
        const monthName = new Date(2000, month, 1).toLocaleString('en-US', { month: 'long' });
        return `${monthName} ${year}`;
      }
      return 'Month';
    }

    if (scope.rangeStart && scope.rangeEnd) {
      return `${scope.rangeStart} - ${scope.rangeEnd}`;
    }
    return 'Date Range';
  }, [scope]);

  const exportSelected = (): void => {
    if (!selectedEmployeeId) {
      return;
    }
    const employee = employees.find((item) => item.id === selectedEmployeeId);
    if (!employee) {
      return;
    }

    const rowsForCsv = exportRowsBuilder(selectedEmployeeId);
    const csv = [
      ['Employee', 'Position', metricLabel, secondaryMetricLabel || ''],
      [
        employee.fullName,
        employee.position,
        metricBuilder(employee),
        secondaryMetricBuilder ? secondaryMetricBuilder(employee) : '',
      ],
      [],
      ...rowsForCsv,
    ]
      .map((row) => row.join(','))
      .join('\n');

    downloadCsv(`${employee.fullName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}.csv`, csv);
  };

  return (
    <Card className="h-[calc(100vh-120px)] min-h-[640px] gap-3">
      <CardHeader className='pb-0'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Search, filter, and select an employee.</CardDescription>
      </CardHeader>
      <CardContent className="h-full pt-0">
        <div className="flex flex-col gap-3 h-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search employee" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>

          <div className="flex gap-2">
            <Select
              value={scope.mode}
              onValueChange={(next) => {
                const mode = next as ScopeFilterState['mode'];
                onScopeChange({ ...scope, mode });
                if (mode === 'month' || mode === 'range') {
                  onOpenScopeModal();
                }
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Filter period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" type="button" onClick={onOpenScopeModal}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" type="button" onClick={exportSelected} disabled={!selectedEmployeeId}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-full overflow-hidden rounded-md border">
            <div className="h-full overflow-y-auto">
              <div className="divide-y">
                {rows.map((employee) => {
                  const isSelected = employee.id === selectedEmployeeId;
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => onSelectEmployee(employee.id)}
                      className={`w-full px-3 py-2 text-left transition-colors ${
                        isSelected ? 'bg-accent' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.avatarUrl} alt={employee.fullName} />
                          <AvatarFallback>
                            {employee.fullName
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{employee.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">{employee.position}</p>
                          <p className="text-xs text-muted-foreground">
                            {metricLabel}: {metricBuilder(employee)}
                            {secondaryMetricBuilder && secondaryMetricLabel
                              ? ` | ${secondaryMetricLabel}: ${secondaryMetricBuilder(employee)}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Paginator currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeListPanel;
