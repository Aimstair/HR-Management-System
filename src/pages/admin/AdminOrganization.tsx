import React from 'react';
import { Card } from '../../../components/ui/card';

const AdminOrganization: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Organization page content will be built here</p>
        <p className="text-sm text-muted-foreground mt-2">Visual matrix/tree: School Branches → Departments → Teams → Employees</p>
      </Card>
    </div>
  );
};

export default AdminOrganization;
