import type {
  AggregatedScore,
  EvaluationSectionScore,
  FacultyEvaluationRecord,
  SemesterFilter,
} from './types';

export const EVALUATION_SCALE = [
  '4 - Great Extent (manifested most of the time)',
  '3 - Moderate Extent (manifested few times)',
  '2 - Less Extent (manifested very occasionally)',
  '1 - Not at All (never manifested)',
];

export const sectionAverage = (section: EvaluationSectionScore): number => {
  if (section.criteria.length === 0) {
    return 0;
  }
  const total = section.criteria.reduce((sum, item) => sum + item.score, 0);
  return Number((total / section.criteria.length).toFixed(2));
};

export const overallAverage = (record: FacultyEvaluationRecord): number => {
  if (record.sections.length === 0) {
    return 0;
  }
  const total = record.sections.reduce((sum, section) => sum + sectionAverage(section), 0);
  return Number((total / record.sections.length).toFixed(2));
};

export const withAcademicFilter = (
  records: FacultyEvaluationRecord[],
  schoolYear: string,
  semester: SemesterFilter,
): FacultyEvaluationRecord[] => {
  return records.filter((record) => {
    const passYear = schoolYear === 'all' || record.schoolYear === schoolYear;
    const passSemester = semester === 'all' || record.semester === semester;
    return passYear && passSemester;
  });
};

const aggregateAverage = (
  records: FacultyEvaluationRecord[],
  keyBuilder: (record: FacultyEvaluationRecord) => string,
): AggregatedScore[] => {
  const aggregate = new Map<string, { total: number; count: number }>();

  records.forEach((record) => {
    const key = keyBuilder(record);
    const current = aggregate.get(key) || { total: 0, count: 0 };
    aggregate.set(key, {
      total: current.total + overallAverage(record),
      count: current.count + 1,
    });
  });

  return Array.from(aggregate.entries())
    .map(([label, value]) => ({
      label,
      average: Number((value.total / Math.max(value.count, 1)).toFixed(2)),
    }))
    .sort((a, b) => b.average - a.average);
};

export const aggregateByDepartment = (records: FacultyEvaluationRecord[]): AggregatedScore[] => {
  return aggregateAverage(records, (record) => record.department);
};

export const aggregateBySchool = (records: FacultyEvaluationRecord[]): AggregatedScore[] => {
  return aggregateAverage(records, (record) => record.school);
};

export const aggregateByFaculty = (records: FacultyEvaluationRecord[]): AggregatedScore[] => {
  return aggregateAverage(records, (record) => record.facultyName);
};

export const averageAcrossRecords = (records: FacultyEvaluationRecord[]): number => {
  if (records.length === 0) {
    return 0;
  }
  const total = records.reduce((sum, record) => sum + overallAverage(record), 0);
  return Number((total / records.length).toFixed(2));
};

export const averageSectionAcrossRecords = (
  records: FacultyEvaluationRecord[],
  sectionId: string,
): number => {
  if (records.length === 0) {
    return 0;
  }

  const sectionScores = records
    .map((record) => record.sections.find((section) => section.id === sectionId))
    .filter((section): section is EvaluationSectionScore => Boolean(section))
    .map((section) => sectionAverage(section));

  if (sectionScores.length === 0) {
    return 0;
  }

  const total = sectionScores.reduce((sum, score) => sum + score, 0);
  return Number((total / sectionScores.length).toFixed(2));
};

export const toCsv = (headers: string[], rows: string[][]): string => {
  const escapeCell = (cell: string): string => `"${cell.replace(/"/g, '""')}"`;
  return [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
};

export const downloadCsv = (fileName: string, csv: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const paginate = <T,>(items: T[], page: number, pageSize: number): { rows: T[]; totalPages: number; safePage: number } => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: items.slice(start, start + pageSize),
    totalPages,
    safePage,
  };
};
