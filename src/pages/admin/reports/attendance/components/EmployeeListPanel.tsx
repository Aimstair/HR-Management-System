import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Input } from '../../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../../components/ui/avatar';
import { Button } from '../../../../../../components/ui/button';
import type { ReportEmployee } from '../types';
import { ScrollArea } from '../../../../../../components/ui/scroll-area';

interface EmployeeListPanelProps {
  employees: ReportEmployee[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (employeeId: string) => void;
}

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) {
    return parts[0]?.slice(0, 2).toUpperCase() || 'NA';
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const EmployeeListPanel: React.FC<EmployeeListPanelProps> = ({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
}) => {
  const [search, setSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((employee) => employee.department))).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const searchMatch =
        !q ||
        employee.fullName.toLowerCase().includes(q) ||
        employee.department.toLowerCase().includes(q) ||
        employee.position.toLowerCase().includes(q);

      const departmentMatch = departmentFilter === 'all' || employee.department === departmentFilter;
      return searchMatch && departmentMatch;
    });
  }, [departmentFilter, employees, search]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Employees</CardTitle>
        <div className="grid grid-cols-1 gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, department, position"
              className="pl-9"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <ScrollArea className="h-[420px]">
        <CardContent className="space-y-2">
          {filtered.map((employee) => {
            const active = selectedEmployeeId === employee.id;
            return (
              <Button
                key={employee.id}
                type="button"
                variant="ghost"
                onClick={() => onSelectEmployee(employee.id)}
                className={`h-auto w-full justify-start rounded-lg border px-3 py-3 ${
                  active ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <div className="flex w-full items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {employee.avatarUrl ? <AvatarImage src={employee.avatarUrl} alt={employee.fullName} /> : null}
                    <AvatarFallback>{initials(employee.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-foreground">{employee.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{employee.department}</p>
                    <p className="truncate text-xs text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
              </Button>
            );
          })}
          {filtered.length === 0 ? <p className="text-sm text-muted-foreground">No employees found.</p> : null}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default EmployeeListPanel;
