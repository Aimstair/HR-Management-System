import React, { useMemo } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import type { EmployeeNode } from '../types';

interface EmployeeGridProps {
  employees: EmployeeNode[];
  search: string;
  statusFilter: 'all' | 'active' | 'inactive';
  onSelectEmployee: (id: string) => void;
}

const statusClassMap: Record<EmployeeNode['status'], string> = {
  Active: 'bg-primary/10 text-primary border-primary/20',
  'On Leave': 'bg-secondary/20 text-secondary-foreground border-secondary/40',
  Retired: 'bg-muted text-muted-foreground border-border',
};

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length < 2) {
    return name.slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const EmployeeGrid: React.FC<EmployeeGridProps> = ({
  employees,
  search,
  statusFilter,
  onSelectEmployee,
}) => {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.fullName.toLowerCase().includes(query) ||
        employee.jobTitle.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active'
          ? employee.status === 'Active'
          : employee.status !== 'Active');

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => onSelectEmployee(employee.id)}
            className="text-left cursor-pointer hover:shadow-md transition-shadow rounded-lg"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11">
                      {employee.avatarUrl ? <AvatarImage src={employee.avatarUrl} alt={employee.fullName} /> : null}
                      <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base leading-tight">{employee.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
                    </div>
                  </div>
                  <Badge className={statusClassMap[employee.status]}>{employee.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{employee.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{employee.phone}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No employees matched your filters.
        </div>
      ) : null}
    </div>
  );
};

export default EmployeeGrid;
