import React from 'react';
import { Card } from '../../../components/ui/card';

const EmployeeDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Dashboard content will be built here</p>
        <p className="text-sm text-muted-foreground mt-2">Quick widgets: current shift, leave balance, recent request statuses</p>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
