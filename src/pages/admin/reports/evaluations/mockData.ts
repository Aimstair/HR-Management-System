import { campuses } from '../../employees/mockData';
import type {
  EvaluationCriterionScore,
  EvaluationSectionScore,
  FacultyEvaluationRecord,
  FacultyProfile,
} from './types';

const teachingFaculty = Array.from(
  new Map(
    campuses
      .flatMap((campus) =>
        campus.departments.flatMap((department) =>
          (department.schools || []).flatMap((school) =>
            school.employees
              .filter((employee) => employee.role === 'Faculty' || employee.role === 'Chairman' || employee.role === 'Dean')
              .map((employee) => ({
                id: employee.id,
                fullName: employee.fullName,
                position: employee.position,
                school: school.name,
                department: department.name,
                avatarUrl: employee.profilePicture || employee.avatarUrl || 'https://picsum.photos/seed/default-faculty/120/120',
                employeeType: 'TEACHING' as const,
              })),
          ),
        ),
      )
      .map((faculty) => [faculty.id, faculty]),
  ).values(),
);

const nonTeachingStaff = Array.from(
  new Map(
    campuses
      .flatMap((campus) =>
        campus.departments.flatMap((department) =>
          (department.employees ?? [])
            .filter((employee) => employee.role === 'Staff' || employee.role === 'HR Admin')
            .map((employee) => ({
              id: employee.id,
              fullName: employee.fullName,
              position: employee.position,
              school: campus.name,
              department: department.name,
              avatarUrl: employee.profilePicture || employee.avatarUrl || 'https://picsum.photos/seed/default-staff/120/120',
              employeeType: 'NON_TEACHING' as const,
            })),
        ),
      )
      .map((staff) => [staff.id, staff]),
  ).values(),
);

export const facultyProfiles: FacultyProfile[] = [...teachingFaculty.slice(0, 10), ...nonTeachingStaff.slice(0, 10)];

const subjectsBySchool: Record<string, Array<{ code: string; title: string }>> = {
  'School of Engineering': [
    { code: 'ENGR 211L', title: 'Engineering Laboratory Techniques' },
    { code: 'CPE 231L', title: 'Microcontrollers Laboratory' },
    { code: 'CPE 241L', title: 'Signals and Systems Laboratory' },
  ],
  'School of Arts & Sciences': [
    { code: 'BIO 112L', title: 'General Biology Laboratory' },
    { code: 'CHEM 102L', title: 'Analytical Chemistry Laboratory' },
    { code: 'NATSCI 101L', title: 'Physical Science Laboratory' },
  ],
  'School of Law': [
    { code: 'LAW 201', title: 'Constitutional Law Review' },
    { code: 'LAW 214', title: 'Statutory Construction' },
    { code: 'LAW 228', title: 'Legal Ethics' },
  ],
  'School of Computer Studies': [
    { code: 'CS 221L', title: 'Data Structures Laboratory' },
    { code: 'CS 242L', title: 'Database Systems Laboratory' },
    { code: 'CS 261L', title: 'Networking Laboratory' },
  ],
};

const kpisByDepartment: Record<string, Array<{ code: string; title: string }>> = {
  HR: [
    { code: 'HR-KPI-01', title: 'Recruitment Turnaround and Onboarding Cycle' },
    { code: 'HR-KPI-02', title: 'Employee Relations Case Resolution Quality' },
  ],
  Accounting: [
    { code: 'ACC-KPI-01', title: 'Payroll Accuracy and Timeliness' },
    { code: 'ACC-KPI-02', title: 'Disbursement Compliance and Reporting' },
  ],
  Maintenance: [
    { code: 'MNT-KPI-01', title: 'Preventive Maintenance Completion Rate' },
    { code: 'MNT-KPI-02', title: 'Facility Incident Response Time' },
  ],
  Cleaners: [
    { code: 'CLN-KPI-01', title: 'Campus Cleanliness Audit Score' },
    { code: 'CLN-KPI-02', title: 'Housekeeping SLA Compliance' },
  ],
};

const schoolYears = ['2024-2025', '2025-2026'];
const semesters: Array<'1st Semester' | '2nd Semester'> = ['1st Semester', '2nd Semester'];

const criterion = (id: string, label: string, score: number): EvaluationCriterionScore => ({ id, label, score });

const boundedScore = (value: number): number => Number(Math.min(4, Math.max(1, value)).toFixed(2));

const scoreFromSeed = (seed: number, offset: number): number => {
  const value = 3.3 + ((seed + offset) % 5 - 2) * 0.18 + (offset % 2 === 0 ? 0.03 : -0.04);
  return boundedScore(value);
};

const makeSections = (seed: number): EvaluationSectionScore[] => [
  {
    id: 'timeliness',
    title: 'Teacher Timeliness Practices',
    criteria: [
      criterion('timeliness-a', 'Attends the laboratory class regularly', scoreFromSeed(seed, 1)),
      criterion('timeliness-b', 'Attends the laboratory class on time', scoreFromSeed(seed, 2)),
      criterion('timeliness-c', 'Starts and ends the class on time', scoreFromSeed(seed, 3)),
      criterion('timeliness-d', 'Ensures the efficient use of time', scoreFromSeed(seed, 4)),
      criterion('timeliness-e', 'Wears appropriate attire for the laboratory class', scoreFromSeed(seed, 5)),
      criterion('timeliness-f', 'Demonstrates appropriate professional behavior', scoreFromSeed(seed, 6)),
    ],
  },
  {
    id: 'delivery-management',
    title: 'Teaching Delivery and Laboratory Class Management',
    criteria: [
      criterion('delivery-a', 'Establishes clear learning outcomes on laboratory activities', scoreFromSeed(seed, 7)),
      criterion(
        'delivery-b',
        'Explains with clarity the instructions and procedures for activities using proper terminologies',
        scoreFromSeed(seed, 8),
      ),
      criterion('delivery-c', 'Demonstrates with clarity laboratory procedures', scoreFromSeed(seed, 9)),
      criterion('delivery-d', 'Connects laboratory activities to prior knowledge and professional discipline', scoreFromSeed(seed, 10)),
      criterion(
        'management-a',
        'Exhibits authority and firmness while maintaining rapport and openness',
        scoreFromSeed(seed, 11),
      ),
      criterion('management-b', 'Enforces safe and proper behaviors in the laboratory', scoreFromSeed(seed, 12)),
      criterion('management-c', "Monitors students' performance inside the laboratory", scoreFromSeed(seed, 13)),
    ],
  },
  {
    id: 'grading-feedback',
    title: "Teacher's Grading System and Providing Feedback",
    criteria: [
      criterion('grading-a', 'Administers a grading system that is valid, fair, and objective', scoreFromSeed(seed, 14)),
      criterion(
        'grading-b',
        'Conducts orientation of the grading system with clarity on output requirements and submissions',
        scoreFromSeed(seed, 15),
      ),
      criterion('grading-c', 'Establishes clear process and schedules of report submissions', scoreFromSeed(seed, 16)),
      criterion('grading-d', 'Conducts periodic feedback on student performance', scoreFromSeed(seed, 17)),
      criterion('grading-e', 'Encourages student consultations on academic or fieldwork concerns', scoreFromSeed(seed, 18)),
    ],
  },
  {
    id: 'laboratory-safety',
    title: 'Laboratory Care and Safety',
    criteria: [
      criterion('safety-a', 'Ensures readiness of equipment and materials for laboratory activities', scoreFromSeed(seed, 19)),
      criterion(
        'safety-b',
        'Orients and reminds students about laboratory safety rules and regulations',
        scoreFromSeed(seed, 20),
      ),
      criterion('safety-c', 'Reminds and compels students for end-of-laboratory clean-up', scoreFromSeed(seed, 21)),
      criterion(
        'safety-d',
        'Reminds students to replace and return equipment and properly shut down computers',
        scoreFromSeed(seed, 22),
      ),
    ],
  },
];

const makeNonTeachingSections = (seed: number): EvaluationSectionScore[] => [
  {
    id: 'service-delivery',
    title: 'Service Delivery and Work Quality',
    criteria: [
      criterion('service-a', 'Delivers assigned tasks accurately and on schedule', scoreFromSeed(seed, 1)),
      criterion('service-b', 'Maintains service standards across recurring activities', scoreFromSeed(seed, 2)),
      criterion('service-c', 'Adapts work plans based on operational priorities', scoreFromSeed(seed, 3)),
    ],
  },
  {
    id: 'coordination',
    title: 'Coordination and Stakeholder Communication',
    criteria: [
      criterion('coord-a', 'Coordinates effectively with related offices and teams', scoreFromSeed(seed, 4)),
      criterion('coord-b', 'Provides timely updates and status reporting', scoreFromSeed(seed, 5)),
      criterion('coord-c', 'Handles requests and concerns professionally', scoreFromSeed(seed, 6)),
    ],
  },
  {
    id: 'process-compliance',
    title: 'Policy Compliance and Process Discipline',
    criteria: [
      criterion('process-a', 'Follows approved policies and standard operating procedures', scoreFromSeed(seed, 7)),
      criterion('process-b', 'Maintains complete and reliable documentation', scoreFromSeed(seed, 8)),
      criterion('process-c', 'Uses institutional resources responsibly and securely', scoreFromSeed(seed, 9)),
    ],
  },
  {
    id: 'initiative',
    title: 'Initiative and Continuous Improvement',
    criteria: [
      criterion('initiative-a', 'Identifies process improvements proactively', scoreFromSeed(seed, 10)),
      criterion('initiative-b', 'Acts on feedback to improve output quality', scoreFromSeed(seed, 11)),
      criterion('initiative-c', 'Supports team goals beyond minimum expectations', scoreFromSeed(seed, 12)),
    ],
  },
];

const strongPointPool = [
  'Explains procedures clearly before lab execution.',
  'Consistently starts sessions on schedule.',
  'Gives timely and constructive performance feedback.',
  'Maintains safe and orderly laboratory workflow.',
  'Relates experiments to real industry scenarios.',
  'Promotes open communication during consultations.',
];

const improvementPool = [
  'Provide more examples before graded experiments.',
  'Increase frequency of formative assessments.',
  'Allocate more time for post-lab synthesis.',
  'Share rubrics earlier in the semester.',
  'Improve pacing for complex instructions.',
  'Publish feedback summaries faster after submissions.',
];

const staffStrongPointPool = [
  'Maintains dependable turnaround for operational requests.',
  'Communicates progress and blockers clearly with stakeholders.',
  'Consistently follows documentation and process controls.',
  'Shows ownership in resolving day-to-day service issues.',
  'Supports team collaboration during peak workload periods.',
  'Introduces practical small improvements to routine tasks.',
];

const staffImprovementPool = [
  'Escalate delays earlier for better cross-team coordination.',
  'Increase update frequency on high-priority tasks.',
  'Improve completeness of process logs and records.',
  'Standardize handoff notes between shifts or units.',
  'Broaden familiarity with related campus policies.',
  'Document recurring issues with root-cause analysis.',
];

const pickPool = (pool: string[], seed: number): string[] => {
  return [pool[seed % pool.length], pool[(seed + 2) % pool.length]];
};

const makeRecordsForFaculty = (faculty: FacultyProfile, facultyIndex: number): FacultyEvaluationRecord[] => {
  const isTeaching = faculty.employeeType === 'TEACHING';
  const subjects = isTeaching
    ? subjectsBySchool[faculty.school] || subjectsBySchool['School of Engineering']
    : kpisByDepartment[faculty.department] || [
        { code: 'OPS-KPI-01', title: 'Operational KPI Review' },
        { code: 'OPS-KPI-02', title: 'Service and Compliance KPI Review' },
      ];

  return schoolYears.flatMap((schoolYear, yearIndex) =>
    semesters.flatMap((semester, semIndex) =>
      subjects.slice(0, 2).map((subject, subjectIndex) => {
        const seed = facultyIndex * 11 + yearIndex * 7 + semIndex * 5 + subjectIndex;
        const day = String((seed % 22) + 6).padStart(2, '0');

        return {
          id: `EVAL-${faculty.id}-${schoolYear}-${semester}-${subject.code}`,
          facultyId: faculty.id,
          facultyName: faculty.fullName,
          position: faculty.position,
          school: faculty.school,
          department: faculty.department,
          subjectCode: subject.code,
          subjectTitle: subject.title,
          schoolYear,
          semester,
          submittedAt: `2026-03-${day}T10:30:00`,
          respondentCount: isTeaching ? 24 + ((seed + 3) % 18) : 8 + ((seed + 2) % 9),
          sections: isTeaching ? makeSections(seed) : makeNonTeachingSections(seed),
          strongPoints: pickPool(isTeaching ? strongPointPool : staffStrongPointPool, seed),
          improvements: pickPool(isTeaching ? improvementPool : staffImprovementPool, seed + 1),
          employeeType: faculty.employeeType,
        } satisfies FacultyEvaluationRecord;
      }),
    ),
  );
};

export const facultyEvaluationRecords: FacultyEvaluationRecord[] = facultyProfiles.flatMap((faculty, index) =>
  makeRecordsForFaculty(faculty, index),
);

export const sectionOrder = ['timeliness', 'delivery-management', 'grading-feedback', 'laboratory-safety'];
