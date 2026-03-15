import React from 'react';
import { Card } from '../../../components/ui/card';

const AdminShifts: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shift Management</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Shift management page content will be built here</p>
        <p className="text-sm text-muted-foreground mt-2">Visual calendar interface for Shift Assignment and Shift Management</p>
      </Card>
    </div>
  );
};

export default AdminShifts;
