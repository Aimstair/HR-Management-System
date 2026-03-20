import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../../../components/ui/avatar';
import { Badge } from '../../../../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import { Label } from '../../../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../../components/ui/select';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../graphs/ChartCard';

interface LeaveDateSummary {
  date: string;
  count: number;
  employees: Array<{
    id: string;
    name: string;
    avatarUrl: string;
    leaveType: string;
    dateRange: string;
    notes: string;
  }>;
}

interface LeaveGraphsPanelProps {
  year: string;
  years: string[];
  onChangeYear: (value: string) => void;
  monthlyCountData: Array<{ month: string; count: number }>;
  leaveByTypeData: Array<{ type: string; count: number }>;
  leaveByDepartmentData: Array<{ department: string; count: number }>;
  leaveByEmployeeData: Array<{ employeeName: string; [leaveType: string]: string | number }>;
  leaveDateSummary: LeaveDateSummary[];
}

const LeaveGraphsPanel: React.FC<LeaveGraphsPanelProps> = ({
  year,
  years,
  onChangeYear,
  monthlyCountData,
  leaveByTypeData,
  leaveByDepartmentData,
  leaveByEmployeeData,
  leaveDateSummary,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Graph Filters</CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm space-y-2">
          <Label>Year</Label>
          <Select value={year} onValueChange={onChangeYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Leave Count by Month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave Requested by Type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveByTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveByDepartmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave Count by Employee">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveByEmployeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="employeeName" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Vacation" stackId="leave" fill="hsl(var(--primary))" />
              <Bar dataKey="Sick" stackId="leave" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Emergency" stackId="leave" fill="hsl(var(--destructive))" />
              <Bar dataKey="Others" stackId="leave" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Date List Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {leaveDateSummary.map((item) => (
            <div key={item.date} className="rounded-md border p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.date}</p>
                <Badge variant="outline">{item.count} employee(s) on leave</Badge>
              </div>
              <div className="space-y-2">
                {item.employees.map((employee) => (
                  <div key={employee.id} className="flex items-start gap-3 rounded border p-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.leaveType} | {employee.dateRange}</p>
                      <p className="text-xs text-muted-foreground">{employee.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveGraphsPanel;
