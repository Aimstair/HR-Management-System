import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Label } from '../../../../../../components/ui/label';
import { Input } from '../../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '../../../../../../components/ui/toggle-group';
import type { GraphDataSet } from '../utils';
import type { GraphFilterMode } from '../types';
import { EmployeeType } from '../../../../../types';

interface GraphsPanelProps {
  isHeadHr: boolean;
  campuses: Array<{ id: string; name: string }>;
  graphMode: GraphFilterMode;
  graphMonth: string;
  graphCampus: string;
  graphEmployeeType: EmployeeType;
  data: GraphDataSet;
  onChangeMode: (value: GraphFilterMode) => void;
  onChangeMonth: (value: string) => void;
  onChangeCampus: (value: string) => void;
  onChangeEmployeeType: (value: EmployeeType) => void;
}

const ChartCard: React.FC<{ title: string; subtitle?: string; className?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  className,
  children,
}) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
      {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
    </CardHeader>
    <CardContent>
      <div className="h-[260px] w-full">{children}</div>
    </CardContent>
  </Card>
);

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
                className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-muted/40 ${
                  isHidden ? 'opacity-50 line-through' : ''
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

const GraphsPanel: React.FC<GraphsPanelProps> = ({
  isHeadHr,
  campuses,
  graphMode,
  graphMonth,
  graphCampus,
  graphEmployeeType,
  data,
  onChangeMode,
  onChangeMonth,
  onChangeCampus,
  onChangeEmployeeType,
}) => {
  const rangeLabel = (() => {
    const now = new Date();
    let start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    let end = new Date(now);

    if (graphMode === 'last30') {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
    }

    if (graphMode === 'thisWeek') {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start = new Date(now);
      start.setDate(now.getDate() + diff);
      start.setHours(0, 0, 0, 0);
    }

    if (graphMode === 'month' && graphMonth) {
      const [year, month] = graphMonth.split('-').map(Number);
      start = new Date(year, (month || 1) - 1, 1, 0, 0, 0);
      end = new Date(year, month || 1, 0, 23, 59, 59);
    }

    const formatRangeDate = (value: Date): string =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(value);

    const startLabel = formatRangeDate(start);
    const endLabel = formatRangeDate(end);

    if (startLabel === endLabel) {
      return `Range: ${startLabel}`;
    }

    return `Range: ${startLabel} - ${endLabel}`;
  })();

  const formatTrendTick = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    }).format(parsed);
  };

  const formatTrendTooltip = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  };

  const presentLegendLabel =
    graphEmployeeType === EmployeeType.TEACHING ? 'Present' : 'Present Staff';
  const absentLegendLabel =
    graphEmployeeType === EmployeeType.TEACHING ? 'Absent' : 'Absent Staff';

  const departments = React.useMemo(
    () => Array.from(new Set([...data.lateByDepartment, ...data.absentByDepartment].map((item) => item.department))),
    [data.absentByDepartment, data.lateByDepartment],
  );

  const departmentColorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    departments.forEach((department) => {
      let hash = 0;
      for (let i = 0; i < department.length; i++) {
        hash = department.charCodeAt(i) + ((hash << 5) - hash);
      }
      map[department] = DEPARTMENT_COLORS[Math.abs(hash) % DEPARTMENT_COLORS.length];
    });
    return map;
  }, [departments]);

  const [hiddenLateDepartments, setHiddenLateDepartments] = React.useState<Set<string>>(new Set());
  const [hiddenAbsentDepartments, setHiddenAbsentDepartments] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setHiddenLateDepartments((current) => new Set([...current].filter((item) => departments.includes(item))));
    setHiddenAbsentDepartments((current) => new Set([...current].filter((item) => departments.includes(item))));
  }, [departments]);

  const toggleHiddenLate = (department: string): void => {
    setHiddenLateDepartments((current) => {
      const next = new Set(current);
      if (next.has(department)) {
        next.delete(department);
      } else {
        next.add(department);
      }
      return next;
    });
  };

  const toggleHiddenAbsent = (department: string): void => {
    setHiddenAbsentDepartments((current) => {
      const next = new Set(current);
      if (next.has(department)) {
        next.delete(department);
      } else {
        next.add(department);
      }
      return next;
    });
  };

  const lateByDepartment = React.useMemo(
    () =>
      data.lateByDepartment.map((item) =>
        hiddenLateDepartments.has(item.department) ? { ...item, value: 0 } : item,
      ),
    [data.lateByDepartment, hiddenLateDepartments],
  );

  const absentByDepartment = React.useMemo(
    () =>
      data.absentByDepartment.map((item) =>
        hiddenAbsentDepartments.has(item.department) ? { ...item, value: 0 } : item,
      ),
    [data.absentByDepartment, hiddenAbsentDepartments],
  );

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

          {isHeadHr && (
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
        <ChartCard title="Attendance Trend" subtitle={rangeLabel} className="xl:col-span-2 relative">
          <div className="flex items-center justify-end pb-2">
            <ToggleGroup
              type="single"
              variant="outline"
              className='absolute top-10'
              size="sm"
              value={graphEmployeeType}
              onValueChange={(value) => {
                if (value === EmployeeType.TEACHING || value === EmployeeType.NON_TEACHING) {
                  onChangeEmployeeType(value);
                }
              }}
            >
              <ToggleGroupItem value={EmployeeType.NON_TEACHING}>Non-Teaching</ToggleGroupItem>
              <ToggleGroupItem value={EmployeeType.TEACHING}>Teaching</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.attendanceTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatTrendTick}
                interval={0}
                minTickGap={6}
                angle={-35}
                textAnchor="end"
                height={52}
              />
              <YAxis />
              <Tooltip labelFormatter={(value) => formatTrendTooltip(String(value))} />
              <Legend verticalAlign="top" height={24} iconType="circle" />
              <Line
                type="linear"
                dataKey="present"
                name={presentLegendLabel}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="linear"
                dataKey="absent"
                name={absentLegendLabel}
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Late by Department" subtitle={rangeLabel}>
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lateByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {lateByDepartment.map((item) => (
                      <Cell
                        key={`late-${item.department}`}
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
              hiddenItems={hiddenLateDepartments}
              onToggle={toggleHiddenLate}
            />
          </div>
        </ChartCard>

        <ChartCard title="Absent by Department" subtitle={rangeLabel}>
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={absentByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={false} axisLine={false} tickLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {absentByDepartment.map((item) => (
                      <Cell
                        key={`absent-${item.department}`}
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
              hiddenItems={hiddenAbsentDepartments}
              onToggle={toggleHiddenAbsent}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default GraphsPanel;
