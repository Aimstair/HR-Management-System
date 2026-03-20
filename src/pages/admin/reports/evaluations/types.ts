export type SemesterFilter = 'all' | '1st Semester' | '2nd Semester' | 'Summer';

export interface EvaluationCriterionScore {
  id: string;
  label: string;
  score: number;
}

export interface EvaluationSectionScore {
  id: string;
  title: string;
  criteria: EvaluationCriterionScore[];
}

export interface FacultyEvaluationRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  position: string;
  school: string;
  department: string;
  subjectCode: string;
  subjectTitle: string;
  schoolYear: string;
  semester: Exclude<SemesterFilter, 'all'>;
  submittedAt: string;
  respondentCount: number;
  sections: EvaluationSectionScore[];
  strongPoints: string[];
  improvements: string[];
}

export interface FacultyProfile {
  id: string;
  fullName: string;
  position: string;
  school: string;
  department: string;
  avatarUrl: string;
}

export interface AggregatedScore {
  label: string;
  average: number;
}
