import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';

const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading profile...</div>;
  }

  const toInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
          <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback className="text-2xl">{toInitials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
          <p className="text-muted-foreground">{user.position || 'Employee'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Primary account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Employee Type</p>
              <p className="font-medium">{user.employeeType}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Department and campus assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Campus</p>
              <p className="font-medium">{user.schoolBranch || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{user.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date Hired</p>
              <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium text-emerald-600">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProfile;
