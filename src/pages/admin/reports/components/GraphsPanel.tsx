import React from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Label } from '../../../../../components/ui/label';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import type { GraphDataSet, } from '../utils';
import type { GraphFilterMode } from '../types';

interface GraphsPanelProps {
  campuses: string[];
  graphMode: GraphFilterMode;
  graphMonth: string;
  graphCampus: string;
  data: GraphDataSet;
  onChangeMode: (value: GraphFilterMode) => void;
  onChangeMonth: (value: string) => void;
  onChangeCampus: (value: string) => void;
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[260px] w-full">{children}</div>
    </CardContent>
  </Card>
);

const GraphsPanel: React.FC<GraphsPanelProps> = ({
  campuses,
  graphMode,
  graphMonth,
  graphCampus,
  data,
  onChangeMode,
  onChangeMonth,
  onChangeCampus,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Graph Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Date Scope</Label>
            <Select value={graphMode} onValueChange={(value) => onChangeMode(value as GraphFilterMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Month</Label>
            <Input type="month" value={graphMonth} onChange={(event) => onChangeMonth(event.target.value)} disabled={graphMode !== 'month'} />
          </div>

          <div className="space-y-2">
            <Label>Campus</Label>
            <Select value={graphCampus} onValueChange={onChangeCampus}>
              <SelectTrigger>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campus</SelectItem>
                {campuses.map((campus) => (
                  <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Manpower of Department per Day">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.manpowerByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Late by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.lateByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Absent by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.absentByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total Late Hours by Employee">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.totalLateHoursByEmployee}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="employeeName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Late Count by Department by Day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.lateCountByDepartmentByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--secondary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Late Count of Team by Day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.lateCountOfTeamByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default GraphsPanel;
