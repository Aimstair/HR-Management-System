import React, { useMemo } from 'react';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import type { CampusNode, SchoolNode } from '../types';

interface SchoolGridProps {
  campus: CampusNode;
  schools: SchoolNode[];
  search: string;
  statusFilter: 'all' | 'active' | 'inactive';
  onSelectSchool: (school: SchoolNode) => void;
}

const SchoolGrid: React.FC<SchoolGridProps> = ({
  campus,
  schools,
  search,
  statusFilter,
  onSelectSchool,
}) => {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return schools.filter((school) => {
      const matchesCampus = school.location.toLowerCase().includes(campus.name.toLowerCase().split(' ')[0].toLowerCase());
      const matchesSearch =
        !query ||
        school.name.toLowerCase().includes(query) ||
        school.location.toLowerCase().includes(query) ||
        school.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? school.status === 'Active' : school.status === 'Inactive');

      return matchesSearch && matchesStatus && matchesCampus;
    });
  }, [campus.name, schools, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((school) => (
          <button key={school.id} type="button" className="text-left" onClick={() => onSelectSchool(school)}>
            <Card className="h-full">
              <img src={school.picture} alt={school.name} className="h-32 w-full object-cover" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{school.name}</CardTitle>
                  <Badge className={school.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-700'}>
                    {school.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{school.location}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{school.contact}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{school.email}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-2 h-4 w-4" />
          No schools available for this campus and filters.
        </div>
      ) : null}
    </div>
  );
};

export default SchoolGrid;
