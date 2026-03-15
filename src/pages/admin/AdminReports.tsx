'use client';

import React, { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '../../../components/ui/badge';
import { Trophy } from 'lucide-react';

interface AttendanceIssue {
  id: string;
  employeeName: string;
  date: string;
  department: string;
  status: 'late' | 'absent';
  minutesLate?: number;
}

interface FinancialData {
  department: string;
  requested: number;
  approved: number;
}

interface ProfessorEvaluation {
  id: string;
  name: string;
  subject: string;
  avgRating: number;
}

const attendanceData: AttendanceIssue[] = [
  {
    id: '1',
    employeeName: 'John Smith',
    date: '2024-03-11',
    department: 'Science',
    status: 'late',
    minutesLate: 15,
  },
  {
    id: '2',
    employeeName: 'Sarah Johnson',
    date: '2024-03-10',
    department: 'Mathematics',
    status: 'absent',
  },
  {
    id: '3',
    employeeName: 'Michael Chen',
    date: '2024-03-09',
    department: 'Science',
    status: 'late',
    minutesLate: 8,
  },
  {
    id: '4',
    employeeName: 'Emma Davis',
    date: '2024-03-08',
    department: 'English',
    status: 'late',
    minutesLate: 22,
  },
  {
    id: '5',
    employeeName: 'Robert Wilson',
    date: '2024-03-07',
    department: 'History',
    status: 'absent',
  },
];

const financialData: FinancialData[] = [
  { department: 'Science', requested: 5200, approved: 4500 },
  { department: 'Mathematics', requested: 3800, approved: 3200 },
  { department: 'English', requested: 2100, approved: 2100 },
  { department: 'History', requested: 1900, approved: 1500 },
  { department: 'Technology', requested: 4200, approved: 3800 },
];

const evaluationsData: ProfessorEvaluation[] = [
  { id: '1', name: 'Dr. Robert Wilson', subject: 'World History', avgRating: 4.8 },
  { id: '2', name: 'Prof. Sarah Johnson', subject: 'Advanced Mathematics', avgRating: 4.6 },
  { id: '3', name: 'Dr. Michael Chen', subject: 'Physics', avgRating: 4.5 },
  { id: '4', name: 'Prof. Emma Davis', subject: 'English Literature', avgRating: 4.7 },
  { id: '5', name: 'Dr. John Martinez', subject: 'Chemistry', avgRating: 4.4 },
];

const AdminReports: React.FC = () => {
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('rating');

  const filteredAttendance = attendanceData.filter((record) => {
    let matches = true;
    if (departmentFilter && record.department !== departmentFilter) {
      matches = false;
    }
    if (dateRangeFilter && !record.date.includes(dateRangeFilter)) {
      matches = false;
    }
    return matches;
  });

  const sortedEvaluations = [...evaluationsData].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.avgRating - a.avgRating;
    }
    return a.name.localeCompare(b.name);
  });

  const departments = Array.from(
    new Set(attendanceData.map((record) => record.department))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Attendance Health</TabsTrigger>
          <TabsTrigger value="financial">Financial Requests</TabsTrigger>
          <TabsTrigger value="evaluations">Faculty Evaluations</TabsTrigger>
        </TabsList>

        {/* Attendance Health Tab */}
        <TabsContent value="attendance" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Attendance Issues</h2>
                <p className="text-sm text-muted-foreground">
                  Track late arrivals and absences by department and date
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="attendanceDate">Filter by Date</Label>
                <Input
                  id="attendanceDate"
                  type="date"
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="attendanceDept">Filter by Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="attendanceDept">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No attendance issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.employeeName}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              record.status === 'late'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {record.status === 'late' ? 'Late' : 'Absent'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.status === 'late'
                            ? `${record.minutesLate} minutes late`
                            : 'Full day absence'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Financial Requests Tab */}
        <TabsContent value="financial" className="space-y-4 mt-6">
          <Card className="p-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Funds Requested vs Approved</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Comparison of requested vs approved funds by department
              </p>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="requested" fill="#3b82f6" name="Requested" />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground mb-1">Total Requested</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${financialData.reduce((sum, d) => sum + d.requested, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground mb-1">Total Approved</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${financialData.reduce((sum, d) => sum + d.approved, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-muted-foreground mb-1">Approval Rate</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {(
                      (financialData.reduce((sum, d) => sum + d.approved, 0) /
                        financialData.reduce((sum, d) => sum + d.requested, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Faculty Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Faculty Ratings</h2>
                <p className="text-sm text-muted-foreground">
                  Average student ratings for faculty members
                </p>
              </div>
              <div>
                <Label htmlFor="sortBy">Sort by</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'rating')}>
                  <SelectTrigger id="sortBy" className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating (High to Low)</SelectItem>
                    <SelectItem value="name">Name (A to Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {sortedEvaluations.map((prof, index) => (
                <div
                  key={prof.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{prof.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {prof.subject}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < Math.floor(prof.avgRating)
                                ? 'text-yellow-400'
                                : i < prof.avgRating
                                ? 'text-yellow-400 opacity-50'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {prof.avgRating.toFixed(1)}/5.0
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log(`View student comments for ${prof.name}`);
                    }}
                  >
                    View Student Comments
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
