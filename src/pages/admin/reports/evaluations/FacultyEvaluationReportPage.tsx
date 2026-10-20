import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import ViewModeHeaderToggle from '../requests/components/common/ViewModeHeaderToggle';
import type { FacultyEvaluationRecord, FacultyProfile, SemesterFilter } from './types';
import FacultyEvaluationDetailPanel from './components/FacultyEvaluationDetailPanel';
import FacultyEvaluationSubjectTable from './components/FacultyEvaluationSubjectTable';
import FacultyListPanel from './components/FacultyListPanel';
import { fetchEvaluationEmployees, fetchEvaluationRecords } from './report-api';
import {
  aggregateByDepartment,
  aggregateBySchool,
  aggregateByCampus,
  averageAcrossRecords,
  downloadCsv,
  overallAverage,
  toCsv,
  withAcademicFilter,
} from './utils';
import EmployeeTypeSegmentedControl from '../../../../components/hr/EmployeeTypeSegmentedControl';

const LEGEND_PAGE_SIZE = 5;

const getColorForLabel = (label: string, colors: string[]): string => {
  let hash = 5381;
  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 2) + hash) + label.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface LegendCarouselProps {
  items: string[];
  colorMap: Map<string, string>;
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
          <span className="text-xs text-muted-foreground">No items</span>
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
                  style={{ backgroundColor: colorMap.get(item) ?? '#3b82f6' }}
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

type EvaluationEmployeeType = 'TEACHING' | 'NON_TEACHING';

const FacultyEvaluationReportPage: React.FC = () => {
  const [facultyProfiles, setFacultyProfiles] = useState<FacultyProfile[]>([]);
  const [facultyEvaluationRecords, setFacultyEvaluationRecords] = useState<FacultyEvaluationRecord[]>([]);
  const [employeeType, setEmployeeType] = useState<EvaluationEmployeeType>('TEACHING');
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [rightPanelMode, setRightPanelMode] = useState<'list' | 'detail'>('list');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('all');
  const [schoolYearFilter, setSchoolYearFilter] = useState<string>('all');
  const [graphSemesterFilter, setGraphSemesterFilter] = useState<SemesterFilter>('all');
  const [graphSchoolYearFilter, setGraphSchoolYearFilter] = useState<string>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [hiddenDepartments, setHiddenDepartments] = useState<Set<string>>(new Set());
  const [hiddenCampuses, setHiddenCampuses] = useState<Set<string>>(new Set());
  const [hiddenSchools, setHiddenSchools] = useState<Set<string>>(new Set());

  const trackLabel = employeeType === 'TEACHING' ? 'Teaching' : 'Non-Teaching';

  React.useEffect(() => {
    let isActive = true;

    void fetchEvaluationEmployees()
      .then((rows) => {
        if (!isActive) {
          return;
        }
        setFacultyProfiles(rows);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unable to load evaluation employees.';
        toast.error(message);
        setFacultyProfiles([]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    let isActive = true;

    void fetchEvaluationRecords(employeeType)
      .then((rows) => {
        if (!isActive) {
          return;
        }
        setFacultyEvaluationRecords(rows);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unable to load evaluation records.';
        toast.error(message);
        setFacultyEvaluationRecords([]);
      });

    return () => {
      isActive = false;
    };
  }, [employeeType]);

  const evaluationIds = useMemo(
    () => new Set(facultyEvaluationRecords.map((record) => record.facultyId)),
    [facultyEvaluationRecords],
  );

  const profilesByType = useMemo(
    () => facultyProfiles.filter(
      (faculty) => faculty.employeeType === employeeType && evaluationIds.has(faculty.id),
    ),
    [employeeType, evaluationIds, facultyProfiles],
  );

  const selectedFaculty = useMemo(
    () => profilesByType.find((faculty) => faculty.id === selectedFacultyId) || null,
    [profilesByType, selectedFacultyId],
  );

  const schools = useMemo(() => {
    const unique = new Set(profilesByType.map((faculty) => faculty.school));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [profilesByType]);

  const filteredFacultyProfiles = useMemo(() => {
    if (schoolFilter === 'all') {
      return profilesByType;
    }

    return profilesByType.filter((faculty) => faculty.school === schoolFilter);
  }, [profilesByType, schoolFilter]);

  const schoolYears = useMemo(() => {
    const unique = new Set(
      facultyEvaluationRecords
        .map((record) => record.schoolYear),
    );
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, [facultyEvaluationRecords]);

  const selectedFacultyRecords = useMemo(() => {
    return facultyEvaluationRecords.filter(
      (record) => record.facultyId === selectedFacultyId,
    );
  }, [selectedFacultyId, facultyEvaluationRecords]);

  const filteredFacultyRecords = useMemo(() => {
    return withAcademicFilter(selectedFacultyRecords, schoolYearFilter, semesterFilter);
  }, [selectedFacultyRecords, schoolYearFilter, semesterFilter]);

  const selectedRecord = useMemo(() => {
    if (!selectedRecordId) {
      return filteredFacultyRecords[0] || null;
    }
    return filteredFacultyRecords.find((record) => record.id === selectedRecordId) || filteredFacultyRecords[0] || null;
  }, [filteredFacultyRecords, selectedRecordId]);

  const careerAverage = useMemo(() => averageAcrossRecords(selectedFacultyRecords), [selectedFacultyRecords]);
  const semesterAverage = useMemo(() => averageAcrossRecords(filteredFacultyRecords), [filteredFacultyRecords]);

  const graphRecords = useMemo(
    () =>
      withAcademicFilter(
        facultyEvaluationRecords,
        graphSchoolYearFilter,
        graphSemesterFilter,
      ),
    [graphSchoolYearFilter, graphSemesterFilter, facultyEvaluationRecords],
  );

  const departmentLabels = useMemo(() => {
    const unique = new Set(profilesByType.map((faculty) => faculty.department));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [profilesByType]);

  const departmentGraph = useMemo(() => {
    const averages = new Map(aggregateByDepartment(graphRecords).map((item) => [item.label, item.average]));
    return departmentLabels.map((label) => ({
      label,
      average: averages.get(label) ?? 0,
    }));
  }, [departmentLabels, graphRecords]);
  const campusGraph = useMemo(() => aggregateByCampus(graphRecords), [graphRecords]);
  const schoolGraph = useMemo(() => aggregateBySchool(graphRecords), [graphRecords]);
  const employeeGraph = useMemo(() => {
    const aggregate = new Map<string, { label: string; total: number; count: number }>();

    graphRecords.forEach((record) => {
      const current = aggregate.get(record.facultyId) || { label: record.facultyName, total: 0, count: 0 };
      aggregate.set(record.facultyId, {
        label: record.facultyName,
        total: current.total + overallAverage(record),
        count: current.count + 1,
      });
    });

    return profilesByType
      .map((faculty) => {
        const data = aggregate.get(faculty.id);
        const average = data ? Number((data.total / Math.max(data.count, 1)).toFixed(2)) : 0;
        return { label: data?.label ?? faculty.fullName, average };
      })
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  }, [graphRecords, profilesByType]);

  const departmentColors = useMemo(
    () => [
      '#2563eb',
      '#f97316',
      '#14b8a6',
      '#a855f7',
      '#ef4444',
      '#22c55e',
      '#eab308',
      '#0ea5e9',
      '#f43f5e',
      '#8b5cf6',
      '#fb7185',
      '#16a34a',
    ],
    [],
  );

  const departmentColorMap = useMemo(() => {
    const map = new Map<string, string>();
    departmentLabels.forEach((label) => {
      map.set(label, getColorForLabel(label, departmentColors));
    });
    return map;
  }, [departmentColors, departmentLabels]);

  const campusColorMap = useMemo(() => {
    const map = new Map<string, string>();
    campusGraph.forEach((item) => {
      map.set(item.label, getColorForLabel(item.label, departmentColors));
    });
    return map;
  }, [departmentColors, campusGraph]);

  const schoolColorMap = useMemo(() => {
    const map = new Map<string, string>();
    schoolGraph.forEach((item) => {
      map.set(item.label, getColorForLabel(item.label, departmentColors));
    });
    return map;
  }, [departmentColors, schoolGraph]);

  const visibleCampusGraph = useMemo(
    () => campusGraph.filter((item) => !hiddenCampuses.has(item.label)),
    [campusGraph, hiddenCampuses],
  );

  const visibleSchoolGraph = useMemo(
    () => schoolGraph.filter((item) => !hiddenSchools.has(item.label)),
    [schoolGraph, hiddenSchools],
  );

  const visibleDepartmentGraph = useMemo(
    () => departmentGraph.filter((item) => !hiddenDepartments.has(item.label)),
    [departmentGraph, hiddenDepartments],
  );

  const departmentLegendPayload = useMemo(
    () => departmentGraph.map((item) => ({
      value: item.label,
      color: departmentColorMap.get(item.label) || '#3b82f6',
      type: 'square' as const,
      inactive: hiddenDepartments.has(item.label),
    })),
    [departmentColorMap, departmentGraph, hiddenDepartments],
  );

  const handleToggleDepartment = (department: string): void => {
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

  const handleToggleCampus = (campus: string): void => {
    setHiddenCampuses((current) => {
      const next = new Set(current);
      if (next.has(campus)) {
        next.delete(campus);
      } else {
        next.add(campus);
      }
      return next;
    });
  };

  const handleToggleSchool = (school: string): void => {
    setHiddenSchools((current) => {
      const next = new Set(current);
      if (next.has(school)) {
        next.delete(school);
      } else {
        next.add(school);
      }
      return next;
    });
  };

  React.useEffect(() => {
    setSelectedRecordId(filteredFacultyRecords[0]?.id || null);
    setRightPanelMode('list');
  }, [selectedFacultyId, semesterFilter, schoolYearFilter, filteredFacultyRecords]);

  React.useEffect(() => {
    setSchoolFilter('all');
  }, [employeeType]);

  React.useEffect(() => {
    if (!selectedFacultyId && profilesByType.length > 0) {
      setSelectedFacultyId(profilesByType[0].id);
    }
  }, [profilesByType, selectedFacultyId]);

  React.useEffect(() => {
    const stillVisible = filteredFacultyProfiles.some((faculty) => faculty.id === selectedFacultyId);
    if (!stillVisible) {
      setSelectedFacultyId(filteredFacultyProfiles[0]?.id || '');
    }
  }, [filteredFacultyProfiles, selectedFacultyId]);

  const handleSelectRecord = (recordId: string): void => {
    setSelectedRecordId(recordId);
    setRightPanelMode('detail');
  };

  const exportFacultyCsv = (facultyId: string): void => {
    const faculty = profilesByType.find((item) => item.id === facultyId);
    if (!faculty) {
      return;
    }

    const rows = withAcademicFilter(
      facultyEvaluationRecords.filter((record) => record.facultyId === facultyId),
      schoolYearFilter,
      semesterFilter,
    ).map((record) => [
      record.facultyName,
      record.school,
      record.department,
      record.subjectCode,
      record.subjectTitle,
      record.schoolYear,
      record.semester,
      String(record.respondentCount),
      overallAverage(record).toFixed(2),
    ]);

    const csv = toCsv(
      [
        'Employee Name',
        'School',
        'Department',
        'Metric Code',
        'Metric Title',
        'School Year',
        'Semester',
        'Respondents',
        'Overall Average',
      ],
      rows,
    );

    downloadCsv(`${faculty.fullName.replace(/\s+/g, '_')}_${employeeType.toLowerCase()}_evaluation_report.csv`, csv);
  };

  return (
    <div className="space-y-4">
      {/* <EmployeeTypeSegmentedControl
        value={employeeType}
        onValueChange={(value) => setEmployeeType(value as EvaluationEmployeeType)}
        includeAll={false}
        className="w-full max-w-sm"
      /> */}
      <ViewModeHeaderToggle mode={viewMode} onChangeMode={setViewMode} />

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
          <FacultyListPanel
            rows={filteredFacultyProfiles}
            schools={schools}
            schoolFilter={schoolFilter}
            onChangeSchoolFilter={setSchoolFilter}
            selectedFacultyId={selectedFacultyId}
            onSelectFaculty={setSelectedFacultyId}
            onExportSelected={exportFacultyCsv}
          />

          <div className="flex flex-col gap-4">
            {rightPanelMode === 'list' ? (
              <>
                <Card className='gap-2'>
                  <CardHeader>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                      <div>
                        <CardTitle>{trackLabel} Performance Report</CardTitle>
                        <CardDescription>
                          {selectedFaculty
                            ? `${selectedFaculty.fullName} (${selectedFaculty.position})`
                            : `Select ${trackLabel.toLowerCase()} employee`}
                        </CardDescription>
                      </div>

                      <Select value={schoolYearFilter} onValueChange={setSchoolYearFilter}>
                        <SelectTrigger className="w-full lg:w-45">
                          <SelectValue placeholder="School Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All School Years</SelectItem>
                          {schoolYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={semesterFilter} onValueChange={(value) => setSemesterFilter(value as SemesterFilter)}>
                        <SelectTrigger className="w-full lg:w-45">
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Semesters</SelectItem>
                          <SelectItem value="1st Semester">1st Semester</SelectItem>
                          <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Filtered Semester Average</p>
                        <p className="text-2xl font-semibold">{semesterAverage.toFixed(2)} / 5.00</p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Career Average (All Records)</p>
                        <p className="text-2xl font-semibold">{careerAverage.toFixed(2)} / 5.00</p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Total Performance Records</p>
                        <p className="text-2xl font-semibold">{filteredFacultyRecords.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-[calc(100vh-312px)] min-h-90 p-0 gap-0">
                  <CardContent className="p-0">
                    <FacultyEvaluationSubjectTable
                      rows={filteredFacultyRecords}
                      selectedRecordId={selectedRecord?.id || null}
                      onSelectRecord={handleSelectRecord}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <FacultyEvaluationDetailPanel record={selectedRecord} onBack={() => setRightPanelMode('list')} />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <CardTitle>{trackLabel} Performance Graph Analytics</CardTitle>
                  <CardDescription>
                    Compare evaluation averages by department, school, and employee.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={graphSchoolYearFilter} onValueChange={setGraphSchoolYearFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="School Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All School Years</SelectItem>
                      {schoolYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={graphSemesterFilter}
                    onValueChange={(value) => setGraphSemesterFilter(value as SemesterFilter)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="1st Semester">1st Semester</SelectItem>
                      <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Score by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visibleDepartmentGraph}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false} />
                      <Tooltip formatter={(value: number) => `${Number(value).toFixed(2)} / 5.00`} />
                      <Legend
                        payload={departmentLegendPayload}
                        wrapperStyle={{ cursor: 'pointer' }}
                        onClick={(entry) => handleToggleDepartment(entry.value as string)}
                      />
                      <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                        {visibleDepartmentGraph.map((entry) => (
                          <Cell
                            key={`department-${entry.label}`}
                            fill={departmentColorMap.get(entry.label) || '#3b82f6'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Score by Campus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-80 w-full flex-col gap-4">
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visibleCampusGraph}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false} />
                        <Tooltip formatter={(value: number) => `${Number(value).toFixed(2)} / 5.00`} />
                        <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                          {visibleCampusGraph.map((entry) => (
                            <Cell
                              key={`campus-${entry.label}`}
                              fill={campusColorMap.get(entry.label) || '#14b8a6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <LegendCarousel
                    items={campusGraph.map((item) => item.label)}
                    colorMap={campusColorMap}
                    hiddenItems={hiddenCampuses}
                    onToggle={handleToggleCampus}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Score by School</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-80 w-full flex-col gap-4">
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visibleSchoolGraph}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false} />
                        <Tooltip formatter={(value: number) => `${Number(value).toFixed(2)} / 5.00`} />
                        <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                          {visibleSchoolGraph.map((entry) => (
                            <Cell
                              key={`school-${entry.label}`}
                              fill={schoolColorMap.get(entry.label) || '#a855f7'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <LegendCarousel
                    items={schoolGraph.map((item) => item.label)}
                    colorMap={schoolColorMap}
                    hiddenItems={hiddenSchools}
                    onToggle={handleToggleSchool}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader>
                <CardTitle className="text-base">Performance Score by Employee (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-80 flex-col gap-2 overflow-y-auto pr-2">
                  {employeeGraph.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {employeeGraph.map((item, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                          <span className="font-medium">{item.label}</span>
                          <Badge variant="secondary">{item.average.toFixed(2)} / 5.00</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyEvaluationReportPage;
