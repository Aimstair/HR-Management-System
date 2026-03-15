import React from 'react';
import { Card } from '../../../components/ui/card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Admin dashboard content will be built here</p>
        <p className="text-sm text-muted-foreground mt-2">High-level metrics: Pending requests, absent today, system health</p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
