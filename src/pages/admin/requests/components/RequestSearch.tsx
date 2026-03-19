import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../../../../components/ui/input';

interface RequestSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const RequestSearch: React.FC<RequestSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        placeholder="Search employees"
      />
    </div>
  );
};

export default RequestSearch;
