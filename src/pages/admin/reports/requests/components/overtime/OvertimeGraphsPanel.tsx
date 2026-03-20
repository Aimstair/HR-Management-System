import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import { Label } from '../../../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../../components/ui/select';
import ChartCard from '../graphs/ChartCard';

interface OvertimeGraphsPanelProps {
  year: string;
  years: string[];
  onChangeYear: (value: string) => void;
  monthlyData: Array<{ month: string; count: number }>;
  departmentCountData: Array<{ department: string; count: number }>;
  departmentDurationData: Array<{ department: string; totalHours: number; averageHours: number }>;
  employeeDurationCountData: Array<{ employeeName: string; count: number; totalHours: number }>;
}

const OvertimeGraphsPanel: React.FC<OvertimeGraphsPanelProps> = ({
  year,
  years,
  onChangeYear,
  monthlyData,
  departmentCountData,
  departmentDurationData,
  employeeDurationCountData,
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
        <ChartCard title="Overtime Requests per Month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Overtime Requested by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Overtime Duration by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentDurationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalHours" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average OT Duration by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentDurationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageHours" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="OT Duration/Count per Employee">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={employeeDurationCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="employeeName" />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Count" />
              <Line yAxisId="right" dataKey="totalHours" stroke="hsl(var(--destructive))" strokeWidth={2} name="Duration (hr)" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default OvertimeGraphsPanel;
