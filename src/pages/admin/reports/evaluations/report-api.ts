import {
  getAdminEmployees,
  getAdminPerformanceEvaluations,
  type AdminEmployeeRecord,
  type AdminPerformanceEvaluationRecord,
  type PerformanceRubricType,
} from '../../../../lib/admin-api';
import type {
  EvaluationSectionScore,
  FacultyEvaluationRecord,
  FacultyProfile,
  SemesterFilter,
} from './types';

const PAGE_LIMIT = 200;
const fallbackAvatarUrl = 'https://picsum.photos/seed/default-employee/120/120';

const collectPaged = async <T,>(
  fetchPage: (page: number) => Promise<{ rows: T[]; pagination: { totalPages: number } }>,
): Promise<T[]> => {
  const rows: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchPage(page);
    rows.push(...response.rows);
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return rows;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toTitleCase = (value: string): string =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const readSemester = (value: unknown): SemesterFilter | undefined => {
  if (value === '1st Semester' || value === '2nd Semester' || value === 'Summer') {
    return value;
  }
  return undefined;
};

const buildSchoolYear = (periodStart: string, periodEnd: string, override?: string): string => {
  if (override && override.trim()) {
    return override.trim();
  }

  const startYear = new Date(periodStart).getUTCFullYear();
  const endYear = new Date(periodEnd).getUTCFullYear();
  if (startYear === endYear) {
    return `${startYear}-${startYear + 1}`;
  }
  return `${startYear}-${endYear}`;
};

const defaultSemester = (periodStart: string): SemesterFilter => {
  const month = new Date(periodStart).getUTCMonth();
  return month < 6 ? '1st Semester' : '2nd Semester';
};

const buildSectionsFromEntries = (
  entries: Array<[string, number]>,
  title: string,
): EvaluationSectionScore[] => {
  if (entries.length === 0) {
    return [];
  }

  return [
    {
      id: 'performance-criteria',
      title,
      criteria: entries.map(([key, score], index) => ({
        id: key,
        label: toTitleCase(key) || `Criterion ${index + 1}`,
        score,
      })),
    },
  ];
};

const parseSections = (
  criteria: Record<string, unknown>,
): EvaluationSectionScore[] => {
  const sectionsValue = Array.isArray(criteria.sections)
    ? criteria.sections
    : isRecord(criteria.metadata) && Array.isArray(criteria.metadata.sections)
      ? criteria.metadata.sections
      : [];

  if (sectionsValue.length > 0) {
    const parsed = sectionsValue
      .map((section, index) => {
        if (!isRecord(section)) {
          return null;
        }

        const sectionId = typeof section.id === 'string' ? section.id : `section-${index + 1}`;
        const sectionTitle = typeof section.title === 'string' ? section.title : `Section ${index + 1}`;
        const rawCriteria = Array.isArray(section.criteria) ? section.criteria : [];
        const criteriaRows = rawCriteria
          .map((criterion, criterionIndex) => {
            if (!isRecord(criterion)) {
              return null;
            }

            const label = typeof criterion.label === 'string'
              ? criterion.label
              : `Criterion ${criterionIndex + 1}`;
            const score = Number(criterion.score);
            if (Number.isNaN(score)) {
              return null;
            }

            const criterionId = typeof criterion.id === 'string'
              ? criterion.id
              : `${sectionId}-${criterionIndex + 1}`;

            return {
              id: criterionId,
              label,
              score,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        if (criteriaRows.length === 0) {
          return null;
        }

        return {
          id: sectionId,
          title: sectionTitle,
          criteria: criteriaRows,
        };
      })
      .filter((section): section is NonNullable<typeof section> => Boolean(section));

    if (parsed.length > 0) {
      return parsed;
    }
  }

  const numericSource = isRecord(criteria.scores) ? criteria.scores : criteria;
  const ignoredKeys = new Set(['respondentCount', 'overallScore']);
  const numericEntries = Object.entries(numericSource)
    .filter(([key, value]) => typeof value === 'number' && !ignoredKeys.has(key))
    .map(([key, value]) => [key, value as number]);

  return buildSectionsFromEntries(numericEntries, 'Performance Criteria');
};

const buildFallbackSections = (overallScore: number): EvaluationSectionScore[] => [
  {
    id: 'overall-score',
    title: 'Overall Score',
    criteria: [
      {
        id: 'overall-score',
        label: 'Overall Score',
        score: overallScore,
      },
    ],
  },
];

const readMeta = (criteria: Record<string, unknown>) => {
  const meta = isRecord(criteria.metadata) ? criteria.metadata : criteria;

  return {
    subjectCode: typeof meta.subjectCode === 'string' ? meta.subjectCode : undefined,
    subjectTitle: typeof meta.subjectTitle === 'string' ? meta.subjectTitle : undefined,
    schoolYear: typeof meta.schoolYear === 'string' ? meta.schoolYear : undefined,
    semester: readSemester(meta.semester),
    respondentCount: typeof meta.respondentCount === 'number' ? meta.respondentCount : undefined,
    strongPoints: Array.isArray(meta.strongPoints)
      ? meta.strongPoints.filter((item): item is string => typeof item === 'string')
      : undefined,
    improvements: Array.isArray(meta.improvements)
      ? meta.improvements.filter((item): item is string => typeof item === 'string')
      : undefined,
  };
};

const toFacultyProfile = (employee: AdminEmployeeRecord): FacultyProfile => {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim() || employee.email;
  const school = employee.school?.name ?? employee.schoolBranch ?? 'Unknown School';
  const department = employee.departmentModel?.name ?? employee.department ?? 'General Affairs';

  return {
    id: employee.id,
    fullName,
    position: employee.position ?? 'Unassigned',
    school,
    department,
    avatarUrl: employee.profileImage ?? fallbackAvatarUrl,
    employeeType: employee.employeeType,
  };
};

const fallbackSubjectLabel = (rubricType: PerformanceRubricType): { code: string; title: string } => {
  return rubricType === 'TEACHING'
    ? { code: 'TEACH-PRF', title: 'Teaching Performance Review' }
    : { code: 'OPS-PRF', title: 'Operational Performance Review' };
};

const toEvaluationRecord = (
  record: AdminPerformanceEvaluationRecord,
): FacultyEvaluationRecord => {
  const criteriaPayload = isRecord(record.criteria) ? record.criteria : {};
  const meta = readMeta(criteriaPayload);
  const sections = parseSections(criteriaPayload);
  const normalizedSections = sections.length > 0 ? sections : buildFallbackSections(record.overallScore);
  const fallbackSubject = fallbackSubjectLabel(record.rubricType);
  const schoolYear = buildSchoolYear(record.periodStart, record.periodEnd, meta.schoolYear);
  const semester = meta.semester ?? defaultSemester(record.periodStart);

  return {
    id: record.id,
    facultyId: record.employeeId,
    facultyName: `${record.employee.firstName} ${record.employee.lastName}`.trim() || record.employee.email,
    position: record.employee.position ?? 'Unassigned',
    campus: record.school.name,
    school: record.department?.school.name ?? 'Unassigned',
    department: record.department?.name ?? 'General Affairs',
    subjectCode: meta.subjectCode ?? fallbackSubject.code,
    subjectTitle: meta.subjectTitle ?? fallbackSubject.title,
    schoolYear,
    semester,
    submittedAt: record.createdAt,
    respondentCount: meta.respondentCount ?? 0,
    sections: normalizedSections,
    strongPoints: meta.strongPoints ?? [],
    improvements: meta.improvements ?? [],
    employeeType: record.employee.employeeType,
  };
};

export const fetchEvaluationEmployees = async (): Promise<FacultyProfile[]> => {
  const rows = await collectPaged((page) =>
    getAdminEmployees({ page, limit: PAGE_LIMIT, isActive: true }),
  );

  return rows.map(toFacultyProfile);
};

export const fetchEvaluationRecords = async (
  employeeType: 'TEACHING' | 'NON_TEACHING',
): Promise<FacultyEvaluationRecord[]> => {
  const rows = await collectPaged((page) =>
    getAdminPerformanceEvaluations({
      page,
      limit: PAGE_LIMIT,
      employeeType,
    }),
  );

  return rows.map(toEvaluationRecord);
};
