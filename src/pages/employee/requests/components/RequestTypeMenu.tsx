import React from 'react';
import { Button } from '../../../../../components/ui/button';
import type { EmployeeRequestType } from '../../shared/employeePortalTypes';
import { EMPLOYEE_REQUEST_TYPE_OPTIONS } from '../requestConfig';

interface RequestTypeMenuProps {
  activeType: EmployeeRequestType;
  onChange: (nextType: EmployeeRequestType) => void;
}

const RequestTypeMenu: React.FC<RequestTypeMenuProps> = ({ activeType, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {EMPLOYEE_REQUEST_TYPE_OPTIONS.map((option) => (
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
