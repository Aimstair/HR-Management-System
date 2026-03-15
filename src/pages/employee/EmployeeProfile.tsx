'use client';

import React from 'react';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Briefcase, Building2 } from 'lucide-react';

interface EmployeeProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  schoolBranch: string;
  position: string;
  manager: string;
  joinDate: string;
  employeeId: string;
}

const profileData: EmployeeProfileData = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@school.edu',
  phone: '(555) 123-4567',
  department: 'Science',
  schoolBranch: 'Main Campus',
  position: 'Senior Science Teacher',
  manager: 'Dr. Alice Johnson',
  joinDate: '2020-08-15',
  employeeId: 'EMP001',
};

const EmployeeProfile: React.FC = () => {
  const handleProfileUpdate = () => {
    toast.success('Profile update request submitted');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="flex items-start gap-6 mb-8">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                  {getInitials(profileData.firstName, profileData.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-muted-foreground mb-4">{profileData.position}</p>
                <p className="text-sm text-muted-foreground">ID: {profileData.employeeId}</p>
              </div>
              <Button onClick={handleProfileUpdate} variant="outline">
                Request Profile Update
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base font-semibold">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base font-semibold">{profileData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-base font-semibold">{profileData.schoolBranch}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-base font-semibold">{profileData.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Job Details Tab */}
        <TabsContent value="job" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-slate-50 border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Position</p>
                  <p className="text-lg font-semibold">{profileData.position}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Department</p>
                  <p className="text-lg font-semibold">{profileData.department}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    School Branch
                  </p>
                  <p className="text-lg font-semibold">{profileData.schoolBranch}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Join Date
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(profileData.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Manager</p>
                    <p className="text-base font-semibold text-blue-900">
                      {profileData.manager}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeProfile;
