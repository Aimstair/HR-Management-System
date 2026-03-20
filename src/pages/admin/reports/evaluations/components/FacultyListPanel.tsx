import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
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
import Paginator from '../../requests/components/Paginator';
import type { FacultyProfile } from '../types';
import { paginate } from '../utils';

interface FacultyListPanelProps {
  rows: FacultyProfile[];
  schools: string[];
  schoolFilter: string;
  onChangeSchoolFilter: (value: string) => void;
  selectedFacultyId: string;
  onSelectFaculty: (facultyId: string) => void;
  onExportSelected: (facultyId: string) => void;
}

const PAGE_SIZE = 8;
const FIXED_ROWS = 8;

const FacultyListPanel: React.FC<FacultyListPanelProps> = ({
  rows,
  schools,
  schoolFilter,
  onChangeSchoolFilter,
  selectedFacultyId,
  onSelectFaculty,
  onExportSelected,
}) => {
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }

    return rows.filter(
      (faculty) =>
        faculty.fullName.toLowerCase().includes(normalized) ||
        faculty.position.toLowerCase().includes(normalized) ||
        faculty.school.toLowerCase().includes(normalized),
    );
  }, [rows, query]);

  const { rows: pagedRows, totalPages, safePage } = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page],
  );

  React.useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [safePage, page]);

  const selected = useMemo(() => rows.find((item) => item.id === selectedFacultyId) || null, [rows, selectedFacultyId]);
  const blankCount = Math.max(0, FIXED_ROWS - pagedRows.length);

  const initials = (fullName: string): string =>
    fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <Card className="h-[calc(100vh-120px)] min-h-160 gap-3">
      <CardHeader className="pb-0">
        <CardTitle>Teaching Faculty</CardTitle>
        <CardDescription>Search and select a professor.</CardDescription>
      </CardHeader>

      <CardContent className="h-full pt-0">
        <div className="flex h-full flex-col gap-3">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                className="pl-9 w-full"
                placeholder="Search faculty"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                />
            </div>

          <div className='flex gap-2 w-full'>
            <Select value={schoolFilter} onValueChange={onChangeSchoolFilter}>
                <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                    <SelectItem key={school} value={school}>
                    {school}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            
            <Button
            variant="outline"
            size="icon"
            onClick={() => selected && onExportSelected(selected.id)}
            disabled={!selected}
            aria-label="Export selected faculty records"
            >
                <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-full overflow-hidden rounded-md border">
            <div className="h-full overflow-y-auto">
              <div className="divide-y">
                {pagedRows.map((faculty) => {
                  const isSelected = faculty.id === selectedFacultyId;

                  return (
                    <button
                      key={faculty.id}
                      type="button"
                      onClick={() => onSelectFaculty(faculty.id)}
                      className={`flex h-[69px] w-full items-center px-3 text-left transition-colors ${
                        isSelected ? 'bg-accent' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex w-full items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={faculty.avatarUrl} alt={faculty.fullName} />
                          <AvatarFallback>{initials(faculty.fullName)}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{faculty.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">{faculty.position}</p>
                          <p className="truncate text-xs text-muted-foreground">{faculty.school}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {Array.from({ length: blankCount }, (_, index) => (
                  <div key={`blank-${index}`} className="h-[69px] border-t" />
                ))}
              </div>
            </div>
          </div>

          <Paginator currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyListPanel;
