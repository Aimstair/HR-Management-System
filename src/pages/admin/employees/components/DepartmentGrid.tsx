import React, { useMemo } from 'react';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import type { CampusNode, DepartmentNode } from '../types';

interface DepartmentGridProps {
  campus: CampusNode;
  search: string;
  statusFilter: 'all' | 'active' | 'inactive';
  onSelectDepartment: (department: DepartmentNode, targetLevel: 'school' | 'employee') => void;
}

const DepartmentGrid: React.FC<DepartmentGridProps> = ({
  campus,
  search,
  statusFilter,
  onSelectDepartment,
}) => {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campus.departments.filter((department) => {
      const matchesSearch =
        !query ||
        department.name.toLowerCase().includes(query) ||
        department.location.toLowerCase().includes(query) ||
        department.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active'
          ? department.status === 'Active'
          : department.status === 'Inactive');

      return matchesSearch && matchesStatus;
    });
  }, [campus.departments, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((department) => {
          const targetLevel = department.name === 'Teaching Faculties' ? 'school' : 'employee';

          return (
            <button
              key={department.id}
              type="button"
              className="text-left cursor-pointer hover:shadow-md transition-shadow rounded-lg"
              onClick={() => onSelectDepartment(department, targetLevel)}
            >
              <Card className="h-full">
                <img src={department.picture} alt={department.name} className="h-32 w-full object-cover" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{department.name}</CardTitle>
                    <Badge className={department.status === 'Active' ? 'bg-primary text-primary' : 'bg-muted text-muted-foreground'}>
                      {department.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{department.location}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{department.contact}</p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{department.email}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-2 h-4 w-4" />
          No departments matched your filters.
        </div>
      ) : null}
    </div>
  );
};

export default DepartmentGrid;
