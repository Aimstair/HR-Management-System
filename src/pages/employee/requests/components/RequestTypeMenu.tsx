import React from 'react';
import { Button } from '../../../../../components/ui/button';
import type { EmployeeRequestType } from '../../shared/employeePortalTypes';
import type { RequestTypeOption } from '../requestConfig';

interface RequestTypeMenuProps {
  activeType: EmployeeRequestType;
  options: RequestTypeOption[];
  onChange: (nextType: EmployeeRequestType) => void;
}

const RequestTypeMenu: React.FC<RequestTypeMenuProps> = ({ activeType, options, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={option.value === activeType ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default RequestTypeMenu;
