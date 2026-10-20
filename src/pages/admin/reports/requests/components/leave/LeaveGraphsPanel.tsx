import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../../../components/ui/avatar';
import { Badge } from '../../../../../../../components/ui/badge';
import { Button } from '../../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import { Label } from '../../../../../../../components/ui/label';
import { Input } from '../../../../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../../components/ui/select';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../graphs/ChartCard';
import type { GraphFilterMode } from '../../attendance/types';
import Paginator from '../Paginator';

interface EmployeeLeaveSummary {
  id: string;
  name: string;
  avatarUrl: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  notes: string;
}

const DEPARTMENT_COLORS = ['#0D3E20', '#2D6A4F', '#6AA58D', '#FEB104', '#2563EB', '#0EA5E9', '#F97316', '#DC2626'];
const LEGEND_PAGE_SIZE = 6;

interface LegendCarouselProps {
  items: string[];
  colorMap: Record<string, string>;
  hiddenItems: Set<string>;
  onToggle: (item: string) => void;
}

const LegendCarousel: React.FC<LegendCarouselProps> = ({ items, colorMap, hiddenItems, onToggle }) => {
  const [page, setPage] = React.useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(items.length / LEGEND_PAGE_SIZE));

  React.useEffect(() => {
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const start = page * LEGEND_PAGE_SIZE;
  const visibleItems = items.slice(start, start + LEGEND_PAGE_SIZE);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={page === 0}
        onClick={() => setPage((current) => Math.max(0, current - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        {visibleItems.length === 0 ? (
          <span className="text-xs text-muted-foreground">No departments</span>
        ) : (
          visibleItems.map((item) => {
            const isHidden = hiddenItems.has(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggle(item)}
                className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-muted/40 ${isHidden ? 'opacity-50 line-through' : ''
                  }`}
              >
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: colorMap[item] ?? DEPARTMENT_COLORS[0] }}
                />
                <span className="max-w-[140px] truncate">{item}</span>
              </button>
            );
          })
        )}
      </div>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={page >= totalPages - 1}
        onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface LeaveGraphsPanelProps {
  isHeadHr: boolean;
  campuses: Array<{ id: string; name: string }>;
  graphMode: GraphFilterMode;
  graphMonth: string;
  graphCampus: string;
  onChangeMode: (value: GraphFilterMode) => void;
  onChangeMonth: (value: string) => void;
  onChangeCampus: (value: string) => void;
  monthlyCountData: Array<{ month: string; count: number }>;
  leaveByTypeData: Array<{ type: string; count: number }>;
  leaveByDepartmentData: Array<{ department: string; count: number }>;
  leaveByEmployeeData: Array<{ employeeName: string;[leaveType: string]: string | number }>;
  leaveList: EmployeeLeaveSummary[];
}

const LeaveGraphsPanel: React.FC<LeaveGraphsPanelProps> = ({
  isHeadHr,
  campuses,
  graphMode,
  graphMonth,
  graphCampus,
  onChangeMode,
  onChangeMonth,
  onChangeCampus,
  monthlyCountData,
  leaveByTypeData,
  leaveByDepartmentData,
  leaveByEmployeeData,
  leaveList,
}) => {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const departments = useMemo(() => leaveByDepartmentData.map((item) => item.department), [leaveByDepartmentData]);
  const departmentColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    departments.forEach((dept) => {
      let hash = 5381;
      for (let i = 0; i < dept.length; i++) {
        hash = ((hash << 5) + hash) + dept.charCodeAt(i);
      }
      map[dept] = DEPARTMENT_COLORS[Math.abs(hash) % DEPARTMENT_COLORS.length];
    });
    return map;
  }, [departments]);

  const [hiddenDepartments, setHiddenDepartments] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHiddenDepartments((current) => new Set([...current].filter((item) => departments.includes(item))));
  }, [departments]);

  const toggleHidden = (department: string): void => {
    setHiddenDepartments((current) => {
      const next = new Set(current);
      if (next.has(department)) {
        next.delete(department);
      } else {
        next.add(department);
      }
      return next;
    });
  };

  const visibleLeaveByDepartmentData = useMemo(() => {
    return leaveByDepartmentData.map((item) =>
      hiddenDepartments.has(item.department) ? { ...item, count: 0 } : item
    );
  }, [leaveByDepartmentData, hiddenDepartments]);

  const filteredLeaveList = useMemo(() => {
    return leaveList.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      if (filterDate) {
        matchDate = item.startDate <= filterDate && item.endDate >= filterDate;
      }
      return matchSearch && matchDate;
    });
  }, [leaveList, search, filterDate]);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredLeaveList.slice(start, start + itemsPerPage);
  }, [filteredLeaveList, page]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaveList.length / itemsPerPage));

  useEffect(() => {
    setPage(1);
  }, [search, filterDate]);

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

          {graphMode === 'month' ? (
            <div className="space-y-2">
              <Label>Month</Label>
              <Input type="month" value={graphMonth} onChange={(event) => onChangeMonth(event.target.value)} />
            </div>
          ) : null}

          {isHeadHr && campuses.length > 0 && (
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select value={graphCampus} onValueChange={onChangeCampus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campus</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleLeaveByDepartmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count">
                    {visibleLeaveByDepartmentData.map((item) => (
                      <Cell
                        key={`cell-${item.department}`}
                        fill={departmentColorMap[item.department] ?? DEPARTMENT_COLORS[0]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <LegendCarousel
              items={departments}
              colorMap={departmentColorMap}
              hiddenItems={hiddenDepartments}
              onToggle={toggleHidden}
            />
          </div>
        </ChartCard>

        <ChartCard title="Leave Count by Employee (Top 10)">
          <div className="flex h-full flex-col gap-2 overflow-y-auto pr-2 min-h-[250px]">
            {leaveByEmployeeData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {leaveByEmployeeData.map((item, index) => {
                  const total = Number(item.Vacation || 0) + Number(item.Sick || 0) + Number(item.Emergency || 0) + Number(item.Others || 0);
                  return (
                    <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <span className="font-medium">{item.employeeName}</span>
                      <Badge variant="secondary">{total} leaves</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Date List Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label>Search Employee</Label>
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Specific Date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            {paginatedList.map((employee) => (
              <div key={employee.id} className="flex items-start gap-3 rounded border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.leaveType} | {employee.dateRange}</p>
                  <p className="text-xs text-muted-foreground mt-1">{employee.notes}</p>
                </div>
              </div>
            ))}
            {paginatedList.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No leave records found.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 flex justify-end">
              <Paginator
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveGraphsPanel;
