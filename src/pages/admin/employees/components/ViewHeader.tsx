import React from 'react';
import { Grid3X3, Plus, Search, TreePine } from 'lucide-react';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';

interface ViewHeaderProps {
  title: string;
  searchValue: string;
  statusFilter: 'all' | 'active' | 'inactive';
  viewMode: 'grid' | 'tree';
  showViewToggle?: boolean;
  onSearch: (value: string) => void;
  onFilterStatus: (value: 'all' | 'active' | 'inactive') => void;
  onToggleView: (value: 'grid' | 'tree') => void;
  onAddNew: () => void;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  searchValue,
  statusFilter,
  viewMode,
  showViewToggle = false,
  onSearch,
  onFilterStatus,
  onToggleView,
  onAddNew,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-sm border p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">Search, filter status, switch view, or add new entries.</p>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search..."
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => onFilterStatus(value as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {showViewToggle ? (
          <Button
            variant="outline"
            onClick={() => onToggleView(viewMode === 'grid' ? 'tree' : 'grid')}
          >
            {viewMode === 'grid' ? <TreePine className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            {viewMode === 'grid' ? 'Tree View' : 'Grid View'}
          </Button>
        ) : null}

        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>
    </div>
  );
};

export default ViewHeader;
