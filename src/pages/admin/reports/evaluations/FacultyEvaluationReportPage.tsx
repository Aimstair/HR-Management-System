import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import ViewModeHeaderToggle from '../requests/components/common/ViewModeHeaderToggle';
import { facultyEvaluationRecords, facultyProfiles } from './mockData';
import type { SemesterFilter } from './types';
import FacultyEvaluationDetailPanel from './components/FacultyEvaluationDetailPanel';
import FacultyEvaluationSubjectTable from './components/FacultyEvaluationSubjectTable';
import FacultyListPanel from './components/FacultyListPanel';
import {
  aggregateByDepartment,
  aggregateByFaculty,
  aggregateBySchool,
  averageAcrossRecords,
  downloadCsv,
  overallAverage,
  toCsv,
  withAcademicFilter,
} from './utils';

const FacultyEvaluationReportPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [rightPanelMode, setRightPanelMode] = useState<'list' | 'detail'>('list');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(facultyProfiles[0]?.id || '');
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('all');
  const [schoolYearFilter, setSchoolYearFilter] = useState<string>('all');
  const [graphSemesterFilter, setGraphSemesterFilter] = useState<SemesterFilter>('all');
  const [graphSchoolYearFilter, setGraphSchoolYearFilter] = useState<string>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const selectedFaculty = useMemo(
    () => facultyProfiles.find((faculty) => faculty.id === selectedFacultyId) || null,
    [selectedFacultyId],
  );

  const schools = useMemo(() => {
    const unique = new Set(facultyProfiles.map((faculty) => faculty.school));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredFacultyProfiles = useMemo(() => {
    if (schoolFilter === 'all') {
      return facultyProfiles;
    }

    return facultyProfiles.filter((faculty) => faculty.school === schoolFilter);
  }, [schoolFilter]);

  const schoolYears = useMemo(() => {
    const unique = new Set(facultyEvaluationRecords.map((record) => record.schoolYear));
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, []);

  const selectedFacultyRecords = useMemo(() => {
    return facultyEvaluationRecords.filter((record) => record.facultyId === selectedFacultyId);
  }, [selectedFacultyId]);

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
    () => withAcademicFilter(facultyEvaluationRecords, graphSchoolYearFilter, graphSemesterFilter),
    [graphSchoolYearFilter, graphSemesterFilter],
  );

  const departmentGraph = useMemo(() => aggregateByDepartment(graphRecords), [graphRecords]);
  const schoolGraph = useMemo(() => aggregateBySchool(graphRecords), [graphRecords]);
  const employeeGraph = useMemo(() => aggregateByFaculty(graphRecords).slice(0, 12), [graphRecords]);

  React.useEffect(() => {
    setSelectedRecordId(filteredFacultyRecords[0]?.id || null);
    setRightPanelMode('list');
  }, [selectedFacultyId, semesterFilter, schoolYearFilter, filteredFacultyRecords]);

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
    const faculty = facultyProfiles.find((item) => item.id === facultyId);
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
        'Faculty Name',
        'School',
        'Department',
        'Subject Code',
        'Subject Title',
        'School Year',
        'Semester',
        'Respondents',
        'Overall Average',
      ],
      rows,
    );

    downloadCsv(`${faculty.fullName.replace(/\s+/g, '_')}_evaluation_report.csv`, csv);
  };

  return (
    <div className="space-y-4">
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
                            <CardTitle>Faculty Evaluation Report</CardTitle>
                            <CardDescription>
                            {selectedFaculty
                                ? `${selectedFaculty.fullName} (${selectedFaculty.position})`
                                : 'Select faculty'}
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
                            <p className="text-2xl font-semibold">{semesterAverage.toFixed(2)} / 4.00</p>
                        </div>
                        <div className="rounded-md border p-3">
                            <p className="text-xs text-muted-foreground">Career Average (All Teaching Years)</p>
                            <p className="text-2xl font-semibold">{careerAverage.toFixed(2)} / 4.00</p>
                        </div>
                        <div className="rounded-md border p-3">
                            <p className="text-xs text-muted-foreground">Total Subject Evaluations</p>
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
                  <CardTitle>Faculty Evaluation Graph Analytics</CardTitle>
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
                <CardTitle className="text-base">Evaluation Score by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentGraph}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis domain={[1, 4]} />
                      <Tooltip formatter={(value: number) => `${Number(value).toFixed(2)} / 4.00`} />
                      <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evaluation Score by School</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schoolGraph}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} height={60} />
                      <YAxis domain={[1, 4]} />
                      <Tooltip formatter={(value: number) => `${Number(value).toFixed(2)} / 4.00`} />
                      <Bar dataKey="average" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Evaluation Score by Employee (Top 12)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-90 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employeeGraph} margin={{ left: 16, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} height={70} />
                      <YAxis domain={[1, 4]} />
                      <Tooltip formatter={(value: number) => `${Number(value).toFixed(2)} / 4.00`} />
                      <Bar dataKey="average" fill="#f97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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
