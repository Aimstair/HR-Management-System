import React, { useMemo, useState } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import type { EmployeeProfile } from './index';

interface EmployeeListProps {
  employees: EmployeeProfile[];
  onCreateEmployee: () => void;
  onSelectEmployee: (id: string) => void;
}

const statusClassMap: Record<EmployeeProfile['status'], string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  'On Leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Retired: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) {
    return 'NA';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onCreateEmployee,
  onSelectEmployee,
}) => {
  const [search, setSearch] = useState<string>('');

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.fullName.toLowerCase().includes(query) ||
        employee.jobTitle.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone.toLowerCase().includes(query)
      );
    });
  }, [employees, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">Browse and manage employee profiles.</p>
        </div>
        <Button onClick={onCreateEmployee}>
          <Plus className="h-4 w-4" />
          Create Employee
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Card Grid</CardTitle>
          <CardDescription>Click a card to open a full profile view.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md pb-4">
            <Input
              placeholder="Search by name, title, email, or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => onSelectEmployee(employee.id)}
                className="text-left"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          {employee.avatarUrl ? <AvatarImage src={employee.avatarUrl} alt={employee.fullName} /> : null}
                          <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold leading-tight">{employee.fullName}</p>
                          <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
                        </div>
                      </div>
                      <Badge className={statusClassMap[employee.status]}>{employee.status}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{employee.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{employee.phone}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No employees found.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeList;
