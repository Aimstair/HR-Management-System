import React from 'react';
import { Card } from '../../../components/ui/card';

const AdminEmployees: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employees</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Employees page content will be built here</p>
        <p className="text-sm text-muted-foreground mt-2">Searchable/filterable data grid + EmployeeProfileManager modal</p>
      </Card>
    </div>
  );
};

export default AdminEmployees;
