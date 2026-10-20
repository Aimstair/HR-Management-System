import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import { Label } from '../../../../../../../components/ui/label';
import { Input } from '../../../../../../../components/ui/input';
import { Badge } from '../../../../../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../../components/ui/select';
import ChartCard from '../graphs/ChartCard';
import type { GraphFilterMode } from '../../attendance/types';

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

interface OvertimeGraphsPanelProps {
  isHeadHr: boolean;
  campuses: Array<{ id: string; name: string }>;
  graphMode: GraphFilterMode;
  graphMonth: string;
  graphCampus: string;
  onChangeMode: (value: GraphFilterMode) => void;
  onChangeMonth: (value: string) => void;
  onChangeCampus: (value: string) => void;
  monthlyData: Array<{ month: string; count: number }>;
  departmentCountData: Array<{ department: string; count: number }>;
  departmentDurationData: Array<{ department: string; totalHours: number; averageHours: number }>;
  employeeDurationCountData: Array<{ employeeName: string; count: number; totalHours: number }>;
}

const OvertimeGraphsPanel: React.FC<OvertimeGraphsPanelProps> = ({
  isHeadHr,
  campuses,
  graphMode,
  graphMonth,
  graphCampus,
  onChangeMode,
  onChangeMonth,
  onChangeCampus,
  monthlyData,
  departmentCountData,
  departmentDurationData,
  employeeDurationCountData,
}) => {
  const departments = useMemo(() => departmentCountData.map((item) => item.department), [departmentCountData]);
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

  const visibleDepartmentCountData = useMemo(() => {
    return departmentCountData.map((item) =>
      hiddenDepartments.has(item.department) ? { ...item, count: 0 } : item
    );
  }, [departmentCountData, hiddenDepartments]);

  const visibleDepartmentDurationData = useMemo(() => {
    return departmentDurationData.map((item) =>
      hiddenDepartments.has(item.department) ? { ...item, totalHours: 0, averageHours: 0 } : item
    );
  }, [departmentDurationData, hiddenDepartments]);

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
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleDepartmentCountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count">
                    {visibleDepartmentCountData.map((item) => (
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

        <ChartCard title="Overtime Duration by Department">
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleDepartmentDurationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalHours">
                    {visibleDepartmentDurationData.map((item) => (
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

        {/* <ChartCard title="Average Overtime Duration by Department">
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleDepartmentDurationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageHours">
                    {visibleDepartmentDurationData.map((item) => (
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
        </ChartCard> */}

        <ChartCard title="Accumulated Overtime Duration per Employee (Top 10)">
          <div className="flex h-full flex-col gap-2 overflow-y-auto pr-2 min-h-[250px]">
            {employeeDurationCountData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {employeeDurationCountData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <span className="font-medium">{item.employeeName}</span>
                    <Badge variant="secondary">{item.totalHours} hr</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default OvertimeGraphsPanel;
