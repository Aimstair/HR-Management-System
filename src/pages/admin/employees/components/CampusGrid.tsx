import React, { useMemo } from 'react';
import { Building2, EllipsisVertical, Mail, MapPin, Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu';
import { Button } from '../../../../../components/ui/button';
import type { CampusNode } from '../types';

interface CampusGridProps {
  campuses: CampusNode[];
  search: string;
  statusFilter: 'all' | 'active' | 'inactive';
  onSelectCampus: (campus: CampusNode) => void;
  onToggleStatus: (campusId: string) => void;
  onEditCampus: (campusId: string) => void;
}

const CampusGrid: React.FC<CampusGridProps> = ({
  campuses,
  search,
  statusFilter,
  onSelectCampus,
  onToggleStatus,
  onEditCampus,
}) => {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campuses.filter((campus) => {
      const matchesSearch =
        !query ||
        campus.name.toLowerCase().includes(query) ||
        campus.address.toLowerCase().includes(query) ||
        campus.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? campus.status === 'Active' : campus.status === 'Inactive');

      return matchesSearch && matchesStatus;
    });
  }, [campuses, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((campus) => (
          <Card key={campus.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow rounded-lg">
            <button type="button" className="w-full text-left cursor-pointer" onClick={() => onSelectCampus(campus)}>
              <img src={campus.picture} alt={campus.name} className="h-36 w-full object-cover  cursor-pointer" />
              <CardHeader className="pb-2 mt-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{campus.name}</CardTitle>
                  <Badge className={campus.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                    {campus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{campus.address}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{campus.contact}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{campus.email}</p>
              </CardContent>
            </button>
            <CardFooter className="pt-0">
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onToggleStatus(campus.id)}>
                      Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditCampus(campus.id)}>
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-2 h-4 w-4" />
          No campuses matched your filters.
        </div>
      ) : null}
    </div>
  );
};

export default CampusGrid;
