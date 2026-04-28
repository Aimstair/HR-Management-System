import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { EmployeeType } from '../../types';

export type EmployeeTypeFilter = 'ALL' | EmployeeType;

interface EmployeeTypeSegmentedControlProps {
  value: EmployeeTypeFilter;
  onValueChange: (value: EmployeeTypeFilter) => void;
  includeAll?: boolean;
  className?: string;
}

const EmployeeTypeSegmentedControl: React.FC<EmployeeTypeSegmentedControlProps> = ({
  value,
  onValueChange,
  includeAll = true,
  className,
}) => {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as EmployeeTypeFilter)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select employee type" />
      </SelectTrigger>
      <SelectContent>
        {includeAll ? <SelectItem value="ALL">All</SelectItem> : null}
        <SelectItem value={EmployeeType.TEACHING}>Teaching</SelectItem>
        <SelectItem value={EmployeeType.NON_TEACHING}>Non-Teaching</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default EmployeeTypeSegmentedControl;
