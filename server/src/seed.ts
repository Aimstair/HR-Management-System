import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/password.js';

const DEFAULT_PASSWORD = 'Password123!';
const NOW = new Date();
const CURRENT_DATE = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()));
const NEXT_DATE = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate() + 1));
const DAY_MS = 24 * 60 * 60 * 1000;
const addDaysUtc = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);
const addHoursUtc = (date: Date, hours: number): Date => new Date(date.getTime() + hours * 60 * 60 * 1000);
const CURRENT_WEEK_START = new Date(
  Date.UTC(
    NOW.getUTCFullYear(),
    NOW.getUTCMonth(),
    NOW.getUTCDate() - ((NOW.getUTCDay() + 6) % 7),
  ),
);
const CURRENT_WEEK_DATES = Array.from({ length: 5 }, (_, index) => addDaysUtc(CURRENT_WEEK_START, index));
const CURRENT_PERIOD_START = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), 1));
const CURRENT_PERIOD_END = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate(), 23, 59, 59));
const CURRENT_SCHOOL_YEAR_START = new Date(Date.UTC(NOW.getUTCFullYear(), 0, 1));
const SCHOOL_YEAR_2024_2025 = '2024-2025';
const SEMESTER_FIRST = '1st Semester';
const SEMESTER_SECOND = '2nd Semester';
const SEMESTER_SUMMER = 'Summer';
const SCHOOL_YEAR_2024_2025_FIRST_START = new Date(Date.UTC(2024, 7, 5));
const SCHOOL_YEAR_2024_2025_FIRST_END = new Date(Date.UTC(2024, 11, 20, 23, 59, 59));
const SCHOOL_YEAR_2024_2025_SECOND_START = new Date(Date.UTC(2025, 0, 6));
const SCHOOL_YEAR_2024_2025_SECOND_END = new Date(Date.UTC(2025, 4, 20, 23, 59, 59));
const SCHOOL_YEAR_2024_2025_SUMMER_START = new Date(Date.UTC(2025, 5, 3));
const SCHOOL_YEAR_2024_2025_SUMMER_END = new Date(Date.UTC(2025, 6, 5, 23, 59, 59));
const GENERATED_EMPLOYEE_TARGET = 250;
const GENERATED_TEACHING_EMPLOYEE_TARGET = 80;
const GENERATED_ON_LEAVE_COUNT = 150;
const GENERATED_PENDING_PER_TYPE = 40;
const GENERATED_REQUEST_TYPES = ['LEAVE', 'UNDERTIME', 'OVERTIME', 'TIME_ADJUSTMENT'] as const;
const GENERATED_REQUEST_STATUS_MIX = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
const GENERATED_REQUEST_PREFIX = 'REQ-GEN-';
const GENERATED_ATTENDANCE_PREFIX = 'NTATT-GEN-';
const GENERATED_TEACHING_SUBJECT_PREFIX = 'SUBJ-GEN-';
const GENERATED_CLASS_SESSION_PREFIX = 'SESSION-GEN-';
const GENERATED_TEACHING_ATTENDANCE_PREFIX = 'TATT-GEN-';
const DAILY_PRESENT_COUNTS = [140, 130, 120, 136, 124, 110, 120];
const DAILY_ABSENT_COUNTS = [100, 110, 120, 104, 116, 130, 120];
const DAILY_LATE_COUNTS = [100, 60, 56, 64, 68, 80, 90];
const TEACHING_DAILY_PRESENT_COUNTS = [110, 116, 120, 124, 114, 118, 122];
const TEACHING_DAILY_ABSENT_COUNTS = [20, 24, 18, 22, 20, 24, 18];

const run = async (): Promise<void> => {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const campuses = [
    {
      campusId: 'SCHOOL-MAIN',
      name: 'Main Campus',
      code: 'MAIN',
      address: 'Taft Avenue, Manila',
      contact: '+63 2 8123 1000',
      email: 'main@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/campus-main/800/480',
    },
    {
      campusId: 'SCHOOL-NORTH',
      name: 'North Campus',
      code: 'NORTH',
      address: 'North Avenue, Quezon City',
      contact: '+63 2 8555 1000',
      email: 'north@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/campus-north/800/480',
    },
    {
      campusId: 'SCHOOL-BASAK',
      name: 'Basak Campus',
      code: 'BASAK',
      address: 'Basak, Cebu City',
      contact: '+63 32 123 1000',
      email: 'basak@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/campus-basak/800/480',
    },
    {
      campusId: 'SCHOOL-QUAD',
      name: 'Quadricentennial Campus',
      code: 'QUAD',
      address: 'Novaliches, Quezon City',
      contact: '+63 2 8999 1000',
      email: 'quadricentennial@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/campus-quad/800/480',
    },
  ];

  for (const campus of campuses) {
    await prisma.campus.upsert({
      where: { campusId: campus.campusId },
      update: campus,
      create: campus,
    });
  }

  const schools = [
    {
      schoolId: 'SCH-ENG',
      name: 'School of Engineering',
      campusId: 'SCHOOL-MAIN',
      type: 'TEACHING' as const,
      location: 'Main Campus',
      contact: '+63 2 8123 2001',
      email: 'engineering@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-eng/500/300',
    },
    {
      schoolId: 'SCH-ARTS',
      name: 'School of Arts and Sciences',
      campusId: 'SCHOOL-MAIN',
      type: 'TEACHING' as const,
      location: 'Main Campus',
      contact: '+63 2 8123 2002',
      email: 'arts.sciences@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-arts/500/300',
    },
    {
      schoolId: 'SCH-BM',
      name: 'School of Business and Management',
      campusId: 'SCHOOL-MAIN',
      type: 'TEACHING' as const,
      location: 'Main Campus',
      contact: '+63 2 8123 2003',
      email: 'business.management@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-bm/500/300',
    },
    {
      schoolId: 'SCH-AMS',
      name: 'School of Allied Medical Sciences',
      campusId: 'SCHOOL-MAIN',
      type: 'TEACHING' as const,
      location: 'Main Campus',
      contact: '+63 2 8123 2004',
      email: 'allied.med@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-ams/500/300',
    },
    {
      schoolId: 'SCH-BUS',
      name: 'School of Business',
      campusId: 'SCHOOL-NORTH',
      type: 'TEACHING' as const,
      location: 'North Campus',
      contact: '+63 2 8555 2001',
      email: 'business@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-north-bus/500/300',
    },
    {
      schoolId: 'SCH-EDU',
      name: 'School of Education',
      campusId: 'SCHOOL-BASAK',
      type: 'TEACHING' as const,
      location: 'Basak Campus',
      contact: '+63 32 123 2001',
      email: 'education.basak@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-edu/500/300',
    },
    {
      schoolId: 'SCH-QUAD-SCI',
      name: 'School of Science - Quadricentennial',
      campusId: 'SCHOOL-QUAD',
      type: 'TEACHING' as const,
      location: 'Quadricentennial Campus',
      contact: '+63 2 8999 2001',
      email: 'science.quad@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-quad-sci/500/300',
    },
    {
      schoolId: 'SCH-NT-MAIN',
      name: 'Non-Teaching Departments',
      campusId: 'SCHOOL-MAIN',
      type: 'NON_TEACHING' as const,
      location: 'Main Campus',
      contact: '+63 2 8123 3001',
      email: 'support.main@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-nt-main/500/300',
    },
    {
      schoolId: 'SCH-NT-NORTH',
      name: 'Non-Teaching Departments',
      campusId: 'SCHOOL-NORTH',
      type: 'NON_TEACHING' as const,
      location: 'North Campus',
      contact: '+63 2 8555 3001',
      email: 'support.north@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-nt-north/500/300',
    },
    {
      schoolId: 'SCH-NT-BASAK',
      name: 'Non-Teaching Departments',
      campusId: 'SCHOOL-BASAK',
      type: 'NON_TEACHING' as const,
      location: 'Basak Campus',
      contact: '+63 32 123 3001',
      email: 'support.basak@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-nt-basak/500/300',
    },
    {
      schoolId: 'SCH-NT-QUAD',
      name: 'Non-Teaching Departments',
      campusId: 'SCHOOL-QUAD',
      type: 'NON_TEACHING' as const,
      location: 'Quadricentennial Campus',
      contact: '+63 2 8999 3001',
      email: 'support.quad@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/school-nt-quad/500/300',
    },
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { schoolId: school.schoolId },
      update: school,
      create: school,
    });
  }

  const departments = [
    {
      departmentId: 'DEPT-CS',
      name: 'Computer Science',
      schoolId: 'SCH-ENG',
      location: 'Engineering Building',
      contact: '+63 2 8123 2101',
      email: 'cs@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-cs/500/300',
    },
    {
      departmentId: 'DEPT-ENG',
      name: 'Engineering',
      schoolId: 'SCH-ENG',
      location: 'Engineering Building',
      contact: '+63 2 8123 2102',
      email: 'engineering.dept@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-eng/500/300',
    },
    {
      departmentId: 'DEPT-ARTS-BIO',
      name: 'Biology',
      schoolId: 'SCH-ARTS',
      location: 'Science Hall',
      contact: '+63 2 8123 2201',
      email: 'biology@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-bio/500/300',
    },
    {
      departmentId: 'DEPT-BM-BA',
      name: 'Business Administration',
      schoolId: 'SCH-BM',
      location: 'Business Center',
      contact: '+63 2 8123 2301',
      email: 'ba@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-bm-ba/500/300',
    },
    {
      departmentId: 'DEPT-BM-ACC',
      name: 'Accountancy',
      schoolId: 'SCH-BM',
      location: 'Business Center',
      contact: '+63 2 8123 2302',
      email: 'accountancy@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-bm-acc/500/300',
    },
    {
      departmentId: 'DEPT-AMS-MLS',
      name: 'Medical Laboratory Science',
      schoolId: 'SCH-AMS',
      location: 'Health Sciences Building',
      contact: '+63 2 8123 2401',
      email: 'mls@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-ams-mls/500/300',
    },
    {
      departmentId: 'DEPT-AMS-NUR',
      name: 'Nursing',
      schoolId: 'SCH-AMS',
      location: 'Health Sciences Building',
      contact: '+63 2 8123 2402',
      email: 'nursing@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-ams-nur/500/300',
    },
    {
      departmentId: 'DEPT-NORTH-BUS-BA',
      name: 'Business Administration',
      schoolId: 'SCH-BUS',
      location: 'North Business Hub',
      contact: '+63 2 8555 2201',
      email: 'ba.north@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-north-ba/500/300',
    },
    {
      departmentId: 'DEPT-NORTH-BUS-ACC',
      name: 'Accountancy',
      schoolId: 'SCH-BUS',
      location: 'North Business Hub',
      contact: '+63 2 8555 2202',
      email: 'accountancy.north@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-north-acc/500/300',
    },
    {
      departmentId: 'DEPT-EDU-ELEM',
      name: 'Elementary Education',
      schoolId: 'SCH-EDU',
      location: 'Education Center',
      contact: '+63 32 123 2201',
      email: 'elem.edu@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-edu-elem/500/300',
    },
    {
      departmentId: 'DEPT-EDU-SEC',
      name: 'Secondary Education',
      schoolId: 'SCH-EDU',
      location: 'Education Center',
      contact: '+63 32 123 2202',
      email: 'sec.edu@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-edu-sec/500/300',
    },
    {
      departmentId: 'DEPT-QUAD-SCI-AS',
      name: 'Applied Science',
      schoolId: 'SCH-QUAD-SCI',
      location: 'Quad Science Building',
      contact: '+63 2 8999 2201',
      email: 'applied.science@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-quad-as/500/300',
    },
    {
      departmentId: 'DEPT-QUAD-SCI-DS',
      name: 'Data Science',
      schoolId: 'SCH-QUAD-SCI',
      location: 'Quad Science Building',
      contact: '+63 2 8999 2202',
      email: 'data.science@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-quad-ds/500/300',
    },
    {
      departmentId: 'DEPT-MAIN-HR',
      name: 'Human Resources',
      schoolId: 'SCH-NT-MAIN',
      location: 'Admin Building',
      contact: '+63 2 8123 3002',
      email: 'hr.main@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-main-hr/500/300',
    },
    {
      departmentId: 'DEPT-MAIN-ACC',
      name: 'Accounting',
      schoolId: 'SCH-NT-MAIN',
      location: 'Finance Office',
      contact: '+63 2 8123 3003',
      email: 'accounting.main@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-main-acc/500/300',
    },
    {
      departmentId: 'DEPT-MAIN-MNT',
      name: 'Maintenance',
      schoolId: 'SCH-NT-MAIN',
      location: 'Facilities Office',
      contact: '+63 2 8123 3004',
      email: 'maintenance.main@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-main-mnt/500/300',
    },
    {
      departmentId: 'DEPT-MAIN-REG',
      name: 'Registrar',
      schoolId: 'SCH-NT-MAIN',
      location: 'Registrar Office',
      contact: '+63 2 8123 3005',
      email: 'registrar.main@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-main-reg/500/300',
    },
    {
      departmentId: 'DEPT-NORTH-HR',
      name: 'Human Resources',
      schoolId: 'SCH-NT-NORTH',
      location: 'Admin Building',
      contact: '+63 2 8555 3002',
      email: 'hr.north@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-north-hr/500/300',
    },
    {
      departmentId: 'DEPT-NORTH-OPS',
      name: 'Operations',
      schoolId: 'SCH-NT-NORTH',
      location: 'Operations Center',
      contact: '+63 2 8555 3003',
      email: 'operations.north@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-north-ops/500/300',
    },
    {
      departmentId: 'DEPT-BASAK-HR',
      name: 'Human Resources',
      schoolId: 'SCH-NT-BASAK',
      location: 'Admin Building',
      contact: '+63 32 123 3002',
      email: 'hr.basak@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-basak-hr/500/300',
    },
    {
      departmentId: 'DEPT-BASAK-OPS',
      name: 'Operations',
      schoolId: 'SCH-NT-BASAK',
      location: 'Operations Center',
      contact: '+63 32 123 3003',
      email: 'operations.basak@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-basak-ops/500/300',
    },
    {
      departmentId: 'DEPT-QUAD-HR',
      name: 'Human Resources',
      schoolId: 'SCH-NT-QUAD',
      location: 'Admin Building',
      contact: '+63 2 8999 3002',
      email: 'hr.quad@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-quad-hr/500/300',
    },
    {
      departmentId: 'DEPT-QUAD-ADM',
      name: 'Administration',
      schoolId: 'SCH-NT-QUAD',
      location: 'Admin Building',
      contact: '+63 2 8999 3003',
      email: 'admin.quad@school.edu',
      status: 'Active',
      picture: 'https://picsum.photos/seed/dep-quad-adm/500/300',
    },
  ];

  const campusNameMap = new Map(campuses.map((campus) => [campus.campusId, campus.name]));
  const departmentNameMap = new Map(departments.map((department) => [department.departmentId, department.name]));
  const campusSchoolMap = new Map([
    ['SCHOOL-MAIN', 'SCH-ENG'],
    ['SCHOOL-NORTH', 'SCH-BUS'],
    ['SCHOOL-BASAK', 'SCH-EDU'],
    ['SCHOOL-QUAD', 'SCH-QUAD-SCI'],
  ]);
  const campusConfigs = [
    {
      campusId: 'SCHOOL-MAIN',
      code: 'main',
      nonTeachingDepartmentIds: ['DEPT-MAIN-HR', 'DEPT-MAIN-ACC', 'DEPT-MAIN-MNT', 'DEPT-MAIN-REG'],
      teachingDepartmentIds: ['DEPT-CS', 'DEPT-ENG', 'DEPT-BM-BA', 'DEPT-BM-ACC', 'DEPT-AMS-MLS', 'DEPT-AMS-NUR'],
    },
    {
      campusId: 'SCHOOL-NORTH',
      code: 'north',
      nonTeachingDepartmentIds: ['DEPT-NORTH-HR', 'DEPT-NORTH-OPS'],
      teachingDepartmentIds: ['DEPT-NORTH-BUS-BA', 'DEPT-NORTH-BUS-ACC'],
    },
    {
      campusId: 'SCHOOL-BASAK',
      code: 'basak',
      nonTeachingDepartmentIds: ['DEPT-BASAK-HR', 'DEPT-BASAK-OPS'],
      teachingDepartmentIds: ['DEPT-EDU-ELEM', 'DEPT-EDU-SEC'],
    },
    {
      campusId: 'SCHOOL-QUAD',
      code: 'quad',
      nonTeachingDepartmentIds: ['DEPT-QUAD-HR', 'DEPT-QUAD-ADM'],
      teachingDepartmentIds: ['DEPT-QUAD-SCI-AS', 'DEPT-QUAD-SCI-DS'],
    },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { departmentId: department.departmentId },
      update: department,
      create: department,
    });
  }

  const users = [
    {
      email: 'head.hr@school.com',
      firstName: 'Harriet',
      lastName: 'Head',
      role: 'ROLE_HEAD_HR' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Human Resources',
      schoolBranch: 'All Campuses',
      position: 'Head HR',
      schoolId: null,
      departmentId: null,
      adminScopeType: 'GLOBAL' as const,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'campus.hr.main@school.com',
      firstName: 'Sam',
      lastName: 'Main',
      role: 'ROLE_CAMPUS_HR' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Human Resources',
      schoolBranch: 'Main Campus',
      position: 'Campus HR',
      schoolId: 'SCHOOL-MAIN',
      departmentId: null,
      adminScopeType: 'SCHOOL' as const,
      adminSchoolId: 'SCHOOL-MAIN',
      adminSchoolName: 'Main Campus',
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'campus.hr.north@school.com',
      firstName: 'Nora',
      lastName: 'North',
      role: 'ROLE_CAMPUS_HR' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Human Resources',
      schoolBranch: 'North Campus',
      position: 'Campus HR',
      schoolId: 'SCHOOL-NORTH',
      departmentId: null,
      adminScopeType: 'SCHOOL' as const,
      adminSchoolId: 'SCHOOL-NORTH',
      adminSchoolName: 'North Campus',
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'campus.hr.basak@school.com',
      firstName: 'Bella',
      lastName: 'Basak',
      role: 'ROLE_CAMPUS_HR' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Human Resources',
      schoolBranch: 'Basak Campus',
      position: 'Campus HR',
      schoolId: 'SCHOOL-BASAK',
      departmentId: null,
      adminScopeType: 'SCHOOL' as const,
      adminSchoolId: 'SCHOOL-BASAK',
      adminSchoolName: 'Basak Campus',
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'campus.hr.quad@school.com',
      firstName: 'Quentin',
      lastName: 'Quad',
      role: 'ROLE_CAMPUS_HR' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Human Resources',
      schoolBranch: 'Quadricentennial Campus',
      position: 'Campus HR',
      schoolId: 'SCHOOL-QUAD',
      departmentId: null,
      adminScopeType: 'SCHOOL' as const,
      adminSchoolId: 'SCHOOL-QUAD',
      adminSchoolName: 'Quadricentennial Campus',
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'employee.teaching@school.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Computer Science',
      schoolBranch: 'Main Campus',
      position: 'Professor',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-CS',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'bm.dean@school.com',
      firstName: 'Beatrice',
      lastName: 'Mendoza',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Business Administration',
      schoolBranch: 'Main Campus',
      position: 'Dean',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-BM-BA',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'bm.chair@school.com',
      firstName: 'Carlos',
      lastName: 'Luna',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Accountancy',
      schoolBranch: 'Main Campus',
      position: 'Chairman',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-BM-ACC',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'bm.faculty@school.com',
      firstName: 'Dana',
      lastName: 'Yu',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Business Administration',
      schoolBranch: 'Main Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-BM-BA',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'ams.dean@school.com',
      firstName: 'Alma',
      lastName: 'Reyes',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Medical Laboratory Science',
      schoolBranch: 'Main Campus',
      position: 'Dean',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-AMS-MLS',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'ams.chair@school.com',
      firstName: 'Rafael',
      lastName: 'Santos',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Nursing',
      schoolBranch: 'Main Campus',
      position: 'Chairman',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-AMS-NUR',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'ams.faculty@school.com',
      firstName: 'Lara',
      lastName: 'Cruz',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Nursing',
      schoolBranch: 'Main Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-AMS-NUR',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'edu.dean@school.com',
      firstName: 'Erika',
      lastName: 'Salazar',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Elementary Education',
      schoolBranch: 'Basak Campus',
      position: 'Dean',
      schoolId: 'SCHOOL-BASAK',
      departmentId: 'DEPT-EDU-ELEM',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'edu.chair@school.com',
      firstName: 'Miguel',
      lastName: 'Domingo',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Secondary Education',
      schoolBranch: 'Basak Campus',
      position: 'Chairman',
      schoolId: 'SCHOOL-BASAK',
      departmentId: 'DEPT-EDU-SEC',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'edu.faculty@school.com',
      firstName: 'Paula',
      lastName: 'Gomez',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Elementary Education',
      schoolBranch: 'Basak Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-BASAK',
      departmentId: 'DEPT-EDU-ELEM',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'eng.faculty@school.com',
      firstName: 'Ethan',
      lastName: 'Garcia',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Engineering',
      schoolBranch: 'Main Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-ENG',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'arts.faculty@school.com',
      firstName: 'Ariana',
      lastName: 'Dela Cruz',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Biology',
      schoolBranch: 'Main Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-ARTS-BIO',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'north.faculty@school.com',
      firstName: 'Noah',
      lastName: 'Bautista',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Business Administration',
      schoolBranch: 'North Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-NORTH',
      departmentId: 'DEPT-NORTH-BUS-BA',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'quad.faculty@school.com',
      firstName: 'Quinn',
      lastName: 'Santos',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'TEACHING' as const,
      department: 'Applied Science',
      schoolBranch: 'Quadricentennial Campus',
      position: 'Faculty',
      schoolId: 'SCHOOL-QUAD',
      departmentId: 'DEPT-QUAD-SCI-AS',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'employee.main.staff@school.com',
      firstName: 'Mia',
      lastName: 'Lopez',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Registrar',
      schoolBranch: 'Main Campus',
      position: 'Registrar Assistant',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-MAIN-REG',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'employee.staff@school.com',
      firstName: 'Nina',
      lastName: 'Staff',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Operations',
      schoolBranch: 'North Campus',
      position: 'Registrar Assistant',
      schoolId: 'SCHOOL-NORTH',
      departmentId: 'DEPT-NORTH-OPS',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'employee.basak.staff@school.com',
      firstName: 'Beth',
      lastName: 'Santos',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Operations',
      schoolBranch: 'Basak Campus',
      position: 'Operations Assistant',
      schoolId: 'SCHOOL-BASAK',
      departmentId: 'DEPT-BASAK-OPS',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'employee.quad.staff@school.com',
      firstName: 'Quincy',
      lastName: 'Reyes',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Administration',
      schoolBranch: 'Quadricentennial Campus',
      position: 'Admin Associate',
      schoolId: 'SCHOOL-QUAD',
      departmentId: 'DEPT-QUAD-ADM',
      adminScopeType: null,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
  ];

  const createdUsers: Record<string, { userId: string }> = {};

  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        ...user,
        passwordHash,
      },
      create: {
        ...user,
        passwordHash,
      },
    });

    createdUsers[user.email] = { userId: created.userId };
  }

  const john = createdUsers['employee.teaching@school.com'];
  const bmDean = createdUsers['bm.dean@school.com'];
  const bmChair = createdUsers['bm.chair@school.com'];
  const bmFaculty = createdUsers['bm.faculty@school.com'];
  const amsDean = createdUsers['ams.dean@school.com'];
  const amsChair = createdUsers['ams.chair@school.com'];
  const amsFaculty = createdUsers['ams.faculty@school.com'];
  const eduDean = createdUsers['edu.dean@school.com'];
  const eduChair = createdUsers['edu.chair@school.com'];
  const eduFaculty = createdUsers['edu.faculty@school.com'];
  const engFaculty = createdUsers['eng.faculty@school.com'];
  const artsFaculty = createdUsers['arts.faculty@school.com'];
  const northFaculty = createdUsers['north.faculty@school.com'];
  const quadFaculty = createdUsers['quad.faculty@school.com'];
  const mia = createdUsers['employee.main.staff@school.com'];
  const nina = createdUsers['employee.staff@school.com'];
  const beth = createdUsers['employee.basak.staff@school.com'];
  const quincy = createdUsers['employee.quad.staff@school.com'];
  const headHr = createdUsers['head.hr@school.com'];
  const mainCampusHr = createdUsers['campus.hr.main@school.com'];
  const northCampusHr = createdUsers['campus.hr.north@school.com'];
  const basakCampusHr = createdUsers['campus.hr.basak@school.com'];
  const quadCampusHr = createdUsers['campus.hr.quad@school.com'];

  const employeesByCampus: Record<string, Array<{ userId: string; departmentId: string | null }>> = {
    'SCHOOL-MAIN': [{ userId: mia.userId, departmentId: 'DEPT-MAIN-REG' }],
    'SCHOOL-NORTH': [{ userId: nina.userId, departmentId: 'DEPT-NORTH-OPS' }],
    'SCHOOL-BASAK': [{ userId: beth.userId, departmentId: 'DEPT-BASAK-OPS' }],
    'SCHOOL-QUAD': [{ userId: quincy.userId, departmentId: 'DEPT-QUAD-ADM' }],
  };

  for (const campus of campusConfigs) {
    const existing = employeesByCampus[campus.campusId] ?? [];
    const needed = Math.max(0, GENERATED_EMPLOYEE_TARGET - existing.length);

    for (let i = 0; i < needed; i += 1) {
      const departmentId = campus.nonTeachingDepartmentIds[i % campus.nonTeachingDepartmentIds.length];
      const departmentName = departmentNameMap.get(departmentId) ?? null;
      const campusName = campusNameMap.get(campus.campusId) ?? campus.campusId;
      const suffix = String(i + 1).padStart(3, '0');
      const email = `gen.${campus.code}.${suffix}@school.com`;

      const created = await prisma.user.upsert({
        where: { email },
        update: {
          email,
          passwordHash,
          firstName: `Staff${suffix}`,
          lastName: campus.code.toUpperCase(),
          role: 'ROLE_EMPLOYEE',
          employeeType: 'NON_TEACHING',
          department: departmentName,
          schoolBranch: campusName,
          position: 'Staff',
          schoolId: campus.campusId,
          departmentId,
          adminScopeType: null,
          adminSchoolId: null,
          adminSchoolName: null,
          adminDepartmentId: null,
          adminDepartmentName: null,
        },
        create: {
          email,
          passwordHash,
          firstName: `Staff${suffix}`,
          lastName: campus.code.toUpperCase(),
          role: 'ROLE_EMPLOYEE',
          employeeType: 'NON_TEACHING',
          department: departmentName,
          schoolBranch: campusName,
          position: 'Staff',
          schoolId: campus.campusId,
          departmentId,
          adminScopeType: null,
          adminSchoolId: null,
          adminSchoolName: null,
          adminDepartmentId: null,
          adminDepartmentName: null,
        },
      });

      existing.push({ userId: created.userId, departmentId });
    }

    employeesByCampus[campus.campusId] = existing;
  }

  const teachingEmployeesByCampus: Record<string, Array<{ userId: string; departmentId: string | null }>> = {
    'SCHOOL-MAIN': [
      { userId: john.userId, departmentId: 'DEPT-CS' },
      { userId: bmDean.userId, departmentId: 'DEPT-BM-BA' },
      { userId: bmChair.userId, departmentId: 'DEPT-BM-ACC' },
      { userId: bmFaculty.userId, departmentId: 'DEPT-BM-BA' },
      { userId: amsDean.userId, departmentId: 'DEPT-AMS-MLS' },
      { userId: amsChair.userId, departmentId: 'DEPT-AMS-NUR' },
      { userId: amsFaculty.userId, departmentId: 'DEPT-AMS-NUR' },
      { userId: engFaculty.userId, departmentId: 'DEPT-ENG' },
      { userId: artsFaculty.userId, departmentId: 'DEPT-ARTS-BIO' },
    ],
    'SCHOOL-NORTH': [
      { userId: northFaculty.userId, departmentId: 'DEPT-NORTH-BUS-BA' },
    ],
    'SCHOOL-BASAK': [
      { userId: eduDean.userId, departmentId: 'DEPT-EDU-ELEM' },
      { userId: eduChair.userId, departmentId: 'DEPT-EDU-SEC' },
      { userId: eduFaculty.userId, departmentId: 'DEPT-EDU-ELEM' },
    ],
    'SCHOOL-QUAD': [
      { userId: quadFaculty.userId, departmentId: 'DEPT-QUAD-SCI-AS' },
    ],
  };

  for (const campus of campusConfigs) {
    const existing = teachingEmployeesByCampus[campus.campusId] ?? [];
    const needed = Math.max(0, GENERATED_TEACHING_EMPLOYEE_TARGET - existing.length);

    for (let i = 0; i < needed; i += 1) {
      const departmentId = campus.teachingDepartmentIds[i % campus.teachingDepartmentIds.length];
      const departmentName = departmentNameMap.get(departmentId) ?? null;
      const campusName = campusNameMap.get(campus.campusId) ?? campus.campusId;
      const suffix = String(i + 1).padStart(3, '0');
      const email = `teach.${campus.code}.${suffix}@school.com`;

      const created = await prisma.user.upsert({
        where: { email },
        update: {
          email,
          passwordHash,
          firstName: `Teacher${suffix}`,
          lastName: campus.code.toUpperCase(),
          role: 'ROLE_EMPLOYEE',
          employeeType: 'TEACHING',
          department: departmentName,
          schoolBranch: campusName,
          position: 'Instructor',
          schoolId: campus.campusId,
          departmentId,
          adminScopeType: null,
          adminSchoolId: null,
          adminSchoolName: null,
          adminDepartmentId: null,
          adminDepartmentName: null,
        },
        create: {
          email,
          passwordHash,
          firstName: `Teacher${suffix}`,
          lastName: campus.code.toUpperCase(),
          role: 'ROLE_EMPLOYEE',
          employeeType: 'TEACHING',
          department: departmentName,
          schoolBranch: campusName,
          position: 'Instructor',
          schoolId: campus.campusId,
          departmentId,
          adminScopeType: null,
          adminSchoolId: null,
          adminSchoolName: null,
          adminDepartmentId: null,
          adminDepartmentName: null,
        },
      });

      existing.push({ userId: created.userId, departmentId });
    }

    teachingEmployeesByCampus[campus.campusId] = existing;
  }

  const nonTeachingEmployeesByCampus: Record<string, Array<{ userId: string; departmentId: string | null }>> = {};

  for (const campus of campusConfigs) {
    const teachingIds = new Set((teachingEmployeesByCampus[campus.campusId] ?? []).map((employee) => employee.userId));
    nonTeachingEmployeesByCampus[campus.campusId] = (employeesByCampus[campus.campusId] ?? []).filter(
      (employee) => !teachingIds.has(employee.userId),
    );
  }

  await prisma.performanceEvaluation.deleteMany({
    where: {
      evaluationId: {
        in: [
          'PERF-JOHN-2025-S1',
          'PERF-JOHN-2025-S2',
          'PERF-JOHN-2025-SUM',
          'PERF-BM-2025-S1',
          'PERF-BM-2025-S2',
          'PERF-BM-2025-SUM',
          'PERF-EDU-2025-S1',
          'PERF-EDU-2025-S2',
          'PERF-EDU-2025-SUM',
          'PERF-ENG-2025-S1',
          'PERF-ENG-2025-S2',
          'PERF-ENG-2025-SUM',
          'PERF-ARTS-2025-S1',
          'PERF-ARTS-2025-S2',
          'PERF-ARTS-2025-SUM',
          'PERF-NORTH-2025-S1',
          'PERF-NORTH-2025-S2',
          'PERF-NORTH-2025-SUM',
          'PERF-QUAD-2025-S1',
          'PERF-QUAD-2025-S2',
          'PERF-QUAD-2025-SUM',
          'PERF-JOHN-2026-Q2',
          'PERF-BM-2026-Q2',
          'PERF-EDU-2026-Q2',
          'PERF-MIA-2026-Q2',
          'PERF-NINA-2026-Q2',
          'PERF-BETH-2026-Q2',
        ],
      },
    },
  });

  await prisma.teachingAttendance.deleteMany({
    where: {
      attendanceId: {
        in: ['TATT-JOHN-CS101-0428', 'TATT-JOHN-CS202-0429'],
      },
    },
  });

  await prisma.nonTeachingAttendance.deleteMany({
    where: {
      attendanceId: {
        in: [
          'NTATT-MIA-2026-04-28',
          'NTATT-MIA-2026-04-29',
          'NTATT-NINA-2026-04-28',
          'NTATT-NINA-2026-04-29',
          'NTATT-BETH-2026-04-28',
          'NTATT-BETH-2026-04-29',
          'NTATT-QUINCY-2026-04-28',
          'NTATT-QUINCY-2026-04-29',
        ],
      },
    },
  });

  await prisma.classSession.deleteMany({
    where: {
      classSessionId: {
        in: ['SESSION-CS101-2026-04-28', 'SESSION-CS202-2026-04-29'],
      },
    },
  });

  await prisma.teachingAssignment.deleteMany({
    where: {
      assignmentId: {
        in: ['ASSIGN-JOHN-CS101', 'ASSIGN-JOHN-CS202'],
      },
    },
  });

  await prisma.subject.deleteMany({
    where: {
      subjectId: {
        in: ['SUBJ-CS101', 'SUBJ-CS202'],
      },
    },
  });

  await prisma.teachingAttendance.deleteMany({
    where: {
      attendanceId: {
        startsWith: GENERATED_TEACHING_ATTENDANCE_PREFIX,
      },
    },
  });

  await prisma.classSession.deleteMany({
    where: {
      classSessionId: {
        startsWith: GENERATED_CLASS_SESSION_PREFIX,
      },
    },
  });

  await prisma.subject.deleteMany({
    where: {
      subjectId: {
        startsWith: GENERATED_TEACHING_SUBJECT_PREFIX,
      },
    },
  });

  await prisma.requestRecord.deleteMany({
    where: {
      requestId: {
        in: [
          'REQ-LEAVE-JOHN',
          'REQ-LEAVE-MIA-APPROVED',
          'REQ-UNDERTIME-MIA',
          'REQ-OVERTIME-JOHN',
          'REQ-SWAP-JOHN',
          'REQ-WFH-JOHN',
          'REQ-TIME-ADJUST-JOHN',
          'REQ-EXPENSE-NINA',
          'REQ-LEAVE-BETH-APPROVED',
          'REQ-LEAVE-BETH',
          'REQ-UNDERTIME-BETH',
          'REQ-OVERTIME-BETH',
          'REQ-SWAP-BETH',
          'REQ-WFH-BETH',
          'REQ-TIME-ADJUST-BETH',
          'REQ-LEAVE-QUINCY-APPROVED',
          'REQ-LEAVE-QUINCY',
          'REQ-UNDERTIME-QUINCY',
          'REQ-OVERTIME-QUINCY',
          'REQ-SWAP-QUINCY',
          'REQ-WFH-QUINCY',
          'REQ-TIME-ADJUST-QUINCY',
        ],
      },
    },
  });

  await prisma.shift.deleteMany({
    where: {
      shiftId: {
        in: ['SHIFT-MAIN-MORNING', 'SHIFT-NORTH-LATE', 'SHIFT-BASAK-EARLY', 'SHIFT-QUAD-DAY'],
      },
    },
  });

  await prisma.memo.deleteMany({
    where: {
      memoId: {
        in: [
          'MEMO-HR-ALL',
          'MEMO-MAIN-MEETING',
          'MEMO-CS-CHECKLIST',
          'MEMO-MIA-REMINDER',
          'MEMO-NORTH-OPS',
          'MEMO-BASAK-OPS',
          'MEMO-QUAD-ADMIN',
        ],
      },
    },
  });

  await prisma.requestRecord.deleteMany({
    where: {
      requestId: {
        startsWith: GENERATED_REQUEST_PREFIX,
      },
    },
  });

  await prisma.nonTeachingAttendance.deleteMany({
    where: {
      attendanceId: {
        startsWith: GENERATED_ATTENDANCE_PREFIX,
      },
    },
  });

  await prisma.requestRecord.createMany({
    data: [
      {
        requestId: 'REQ-LEAVE-JOHN',
        type: 'LEAVE',
        status: 'PENDING',
        title: 'Leave Request - John Doe',
        description: 'Family event leave',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: john.userId,
        reviewedById: null,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
      },
      {
        requestId: 'REQ-LEAVE-MIA-APPROVED',
        type: 'LEAVE',
        status: 'APPROVED',
        title: 'Leave Request - Mia Lopez',
        description: 'Family medical appointment',
        remarks: 'Approved by HR for medical appointment.',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: mia.userId,
        reviewedById: mainCampusHr.userId,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-MAIN-REG',
      },
      {
        requestId: 'REQ-UNDERTIME-MIA',
        type: 'UNDERTIME',
        status: 'PENDING',
        title: 'Undertime Request - Mia Lopez',
        description: 'Doctor appointment',
        employeeId: mia.userId,
        reviewedById: null,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-MAIN-REG',
      },
      {
        requestId: 'REQ-OVERTIME-JOHN',
        type: 'OVERTIME',
        status: 'PENDING',
        title: 'Overtime Request - John Doe',
        description: 'Exam preparation support',
        leaveStartDate: addHoursUtc(CURRENT_DATE, 18),
        leaveEndDate: addHoursUtc(CURRENT_DATE, 21),
        employeeId: john.userId,
        reviewedById: null,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
      },
      {
        requestId: 'REQ-TIME-ADJUST-JOHN',
        type: 'TIME_ADJUSTMENT',
        status: 'PENDING',
        title: 'Time Adjustment Request - John Doe',
        description: 'Time adjustment request',
        leaveStartDate: addHoursUtc(CURRENT_DATE, 9),
        leaveEndDate: addHoursUtc(CURRENT_DATE, 18),
        employeeId: john.userId,
        reviewedById: null,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
      },
      {
        requestId: 'REQ-EXPENSE-NINA',
        type: 'EXPENSE',
        status: 'APPROVED',
        title: 'Expense Request - Nina North',
        description: 'Course materials reimbursement',
        remarks: 'Approved for reimbursement.',
        employeeId: nina.userId,
        reviewedById: northCampusHr.userId,
        campusId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-OPS',
      },
      {
        requestId: 'REQ-LEAVE-BETH-APPROVED',
        type: 'LEAVE',
        status: 'APPROVED',
        title: 'Leave Request - Beth Santos',
        description: 'Family travel leave',
        remarks: 'Approved by HR.',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: beth.userId,
        reviewedById: basakCampusHr.userId,
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
      },
      {
        requestId: 'REQ-LEAVE-BETH',
        type: 'LEAVE',
        status: 'PENDING',
        title: 'Leave Request - Beth Santos',
        description: 'Personal leave',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: beth.userId,
        reviewedById: null,
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
      },
      {
        requestId: 'REQ-UNDERTIME-BETH',
        type: 'UNDERTIME',
        status: 'PENDING',
        title: 'Undertime Request - Beth Santos',
        description: 'Client meeting',
        employeeId: beth.userId,
        reviewedById: null,
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
      },
      {
        requestId: 'REQ-OVERTIME-BETH',
        type: 'OVERTIME',
        status: 'PENDING',
        title: 'Overtime Request - Beth Santos',
        description: 'Inventory audit',
        leaveStartDate: addHoursUtc(CURRENT_DATE, 18),
        leaveEndDate: addHoursUtc(CURRENT_DATE, 21),
        employeeId: beth.userId,
        reviewedById: null,
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
      },
      {
        requestId: 'REQ-TIME-ADJUST-BETH',
        type: 'TIME_ADJUSTMENT',
        status: 'PENDING',
        title: 'Time Adjustment Request - Beth Santos',
        description: 'Time adjustment request',
        leaveStartDate: addHoursUtc(CURRENT_DATE, 9),
        leaveEndDate: addHoursUtc(CURRENT_DATE, 18),
        employeeId: beth.userId,
        reviewedById: null,
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
      },
      {
        requestId: 'REQ-LEAVE-QUINCY-APPROVED',
        type: 'LEAVE',
        status: 'APPROVED',
        title: 'Leave Request - Quincy Reyes',
        description: 'Conference attendance',
        remarks: 'Approved for conference attendance.',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: quincy.userId,
        reviewedById: quadCampusHr.userId,
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
      },
      {
        requestId: 'REQ-LEAVE-QUINCY',
        type: 'LEAVE',
        status: 'PENDING',
        title: 'Leave Request - Quincy Reyes',
        description: 'Personal time off',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: quincy.userId,
        reviewedById: null,
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
      },
      {
        requestId: 'REQ-UNDERTIME-QUINCY',
        type: 'UNDERTIME',
        status: 'PENDING',
        title: 'Undertime Request - Quincy Reyes',
        description: 'Campus visit',
        employeeId: quincy.userId,
        reviewedById: null,
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
      },
      {
        requestId: 'REQ-OVERTIME-QUINCY',
        type: 'OVERTIME',
        status: 'PENDING',
        title: 'Overtime Request - Quincy Reyes',
        description: 'Event support',
        leaveStartDate: addHoursUtc(CURRENT_DATE, 18),
        leaveEndDate: addHoursUtc(CURRENT_DATE, 21),
        employeeId: quincy.userId,
        reviewedById: null,
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
      },
      {
        requestId: 'REQ-TIME-ADJUST-QUINCY',
        type: 'TIME_ADJUSTMENT',
        status: 'PENDING',
        title: 'Time Adjustment Request - Quincy Reyes',
        description: 'Time adjustment request',
        leaveStartDate: addHoursUtc(CURRENT_DATE, 9),
        leaveEndDate: addHoursUtc(CURRENT_DATE, 18),
        employeeId: quincy.userId,
        reviewedById: null,
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
      },
    ],
    skipDuplicates: true,
  });

  const campusReviewerMap: Record<string, { userId: string }> = {
    'SCHOOL-MAIN': mainCampusHr,
    'SCHOOL-NORTH': northCampusHr,
    'SCHOOL-BASAK': basakCampusHr,
    'SCHOOL-QUAD': quadCampusHr,
  };

  const generatedRequests: Array<{
    requestId: string;
    type: 'LEAVE' | 'UNDERTIME' | 'OVERTIME' | 'TIME_ADJUSTMENT';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    title: string;
    description: string;
    remarks?: string | null;
    leaveStartDate?: Date;
    leaveEndDate?: Date;
    employeeId: string;
    reviewedById: string | null;
    campusId: string;
    departmentId: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }> = [];

  for (const campus of campusConfigs) {
    const campusEmployees = nonTeachingEmployeesByCampus[campus.campusId] ?? [];
    const approver = campusReviewerMap[campus.campusId];

    for (let i = 0; i < GENERATED_ON_LEAVE_COUNT; i += 1) {
      const employee = campusEmployees[i % campusEmployees.length];
      const titleSuffix = String(i + 1).padStart(3, '0');

      generatedRequests.push({
        requestId: `${GENERATED_REQUEST_PREFIX}${campus.code}-leave-approved-${titleSuffix}`,
        type: 'LEAVE',
        status: 'APPROVED',
        title: `Approved Leave ${campus.code.toUpperCase()} ${titleSuffix}`,
        description: 'Approved leave request',
        remarks: 'Approved by HR.',
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: employee.userId,
        reviewedById: approver?.userId ?? null,
        campusId: campus.campusId,
        departmentId: employee.departmentId,
      });
    }

    GENERATED_REQUEST_TYPES.forEach((type, typeIndex) => {
      const requestLabel = type === 'TIME_ADJUSTMENT' ? 'Time Adjustment' : type.replace('_', ' ');
      const requestDescription =
        type === 'TIME_ADJUSTMENT' ? 'time adjustment' : type.replace('_', ' ').toLowerCase();
      for (let i = 0; i < GENERATED_PENDING_PER_TYPE; i += 1) {
        const employee = campusEmployees[(typeIndex * GENERATED_PENDING_PER_TYPE + i) % campusEmployees.length];
        const titleSuffix = String(i + 1).padStart(3, '0');

        generatedRequests.push({
          requestId: `${GENERATED_REQUEST_PREFIX}${campus.code}-${type.toLowerCase()}-${titleSuffix}`,
          type,
          status: 'PENDING',
          title: `Pending ${requestLabel} ${campus.code.toUpperCase()} ${titleSuffix}`,
          description: `Pending ${requestDescription} request`,
          remarks: null,
          ...(type === 'LEAVE'
            ? {
                leaveStartDate: CURRENT_DATE,
                leaveEndDate: NEXT_DATE,
              }
            : {}),
          employeeId: employee.userId,
          reviewedById: null,
          campusId: campus.campusId,
          departmentId: employee.departmentId,
        });
      }

      GENERATED_REQUEST_STATUS_MIX.forEach((status, statusIndex) => {
        const employee =
          campusEmployees[(typeIndex * GENERATED_REQUEST_STATUS_MIX.length + statusIndex) % campusEmployees.length];
        const titleSuffix = `${String(typeIndex + 1).padStart(2, '0')}${String(statusIndex + 1).padStart(2, '0')}`;
        const weekDate = CURRENT_WEEK_DATES[(typeIndex + statusIndex) % CURRENT_WEEK_DATES.length] ?? CURRENT_DATE;
        const scheduleStart = addHoursUtc(weekDate, 8 + statusIndex);
        const scheduleEnd = type === 'LEAVE' ? addDaysUtc(scheduleStart, 1) : addHoursUtc(scheduleStart, 2);
        const statusLabel =
          status === 'PENDING'
            ? 'Pending'
            : status === 'APPROVED'
              ? 'Approved'
              : status === 'REJECTED'
                ? 'Rejected'
                : 'Cancelled';

        generatedRequests.push({
          requestId: `${GENERATED_REQUEST_PREFIX}${campus.code}-${type.toLowerCase()}-${status.toLowerCase()}-${titleSuffix}`,
          type,
          status,
          title: `${statusLabel} ${requestLabel} ${campus.code.toUpperCase()} ${titleSuffix}`,
          description: `${statusLabel.toLowerCase()} ${requestDescription} request`,
          remarks:
            status === 'APPROVED'
              ? 'Approved by HR.'
              : status === 'REJECTED'
                ? 'Rejected due to missing documentation.'
                : status === 'CANCELLED'
                  ? 'Cancelled by employee.'
                  : null,
          leaveStartDate: scheduleStart,
          leaveEndDate: scheduleEnd,
          employeeId: employee.userId,
          reviewedById: status === 'PENDING' ? null : approver?.userId ?? null,
          campusId: campus.campusId,
          departmentId: employee.departmentId,
          createdAt: scheduleStart,
          updatedAt: scheduleStart,
        });
      });
    });
  }

  await prisma.requestRecord.createMany({
    data: generatedRequests,
    skipDuplicates: true,
  });

  await prisma.shift.createMany({
    data: [
      {
        shiftId: 'SHIFT-MAIN-MORNING',
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        createdById: mainCampusHr.userId,
      },
      {
        shiftId: 'SHIFT-NORTH-LATE',
        name: 'Late Shift',
        startTime: '10:00',
        endTime: '18:00',
        campusId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-OPS',
        createdById: northCampusHr.userId,
      },
      {
        shiftId: 'SHIFT-BASAK-EARLY',
        name: 'Early Shift',
        startTime: '07:00',
        endTime: '15:00',
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
        createdById: basakCampusHr.userId,
      },
      {
        shiftId: 'SHIFT-QUAD-DAY',
        name: 'Day Shift',
        startTime: '09:00',
        endTime: '17:00',
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
        createdById: quadCampusHr.userId,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.memo.createMany({
    data: [
      {
        memoId: 'MEMO-HR-ALL',
        memoType: 'Policy Memo',
        title: 'Global Attendance Reminder',
        content: 'Please review the updated attendance policy effective immediately.',
        attachments: [],
        effectiveDate: CURRENT_DATE,
        scopeType: 'GLOBAL',
        campusId: null,
        schoolId: null,
        departmentId: null,
        recipientEmployeeId: null,
        createdById: headHr.userId,
      },
      {
        memoId: 'MEMO-MAIN-MEETING',
        memoType: 'Meeting Memo',
        title: 'Main Campus Meeting',
        content: 'Faculty meeting this Friday at 3 PM.',
        attachments: ['https://picsum.photos/seed/memo-main-meeting/480/280'],
        effectiveDate: CURRENT_DATE,
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-MAIN',
        schoolId: null,
        departmentId: null,
        recipientEmployeeId: null,
        createdById: mainCampusHr.userId,
      },
      {
        memoId: 'MEMO-CS-CHECKLIST',
        memoType: 'Internal Memo',
        title: 'CS Department Checklist',
        content: 'Submit semester grading templates by Monday.',
        attachments: [],
        effectiveDate: CURRENT_DATE,
        scopeType: 'DEPARTMENT',
        campusId: 'SCHOOL-MAIN',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        recipientEmployeeId: null,
        createdById: mainCampusHr.userId,
      },
      {
        memoId: 'MEMO-MIA-REMINDER',
        memoType: 'Internal Memo',
        title: 'Registrar Coverage Reminder',
        content: 'Please confirm coverage for the registrar desk this Friday.',
        attachments: [],
        effectiveDate: CURRENT_DATE,
        scopeType: 'DEPARTMENT',
        campusId: 'SCHOOL-MAIN',
        schoolId: 'SCH-NT-MAIN',
        departmentId: 'DEPT-MAIN-REG',
        recipientEmployeeId: mia.userId,
        createdById: mainCampusHr.userId,
      },
      {
        memoId: 'MEMO-NORTH-OPS',
        memoType: 'Internal Memo',
        title: 'North Ops Checklist',
        content: 'Please submit the weekly operations checklist by Thursday 5 PM.',
        attachments: [],
        effectiveDate: CURRENT_DATE,
        scopeType: 'DEPARTMENT',
        campusId: 'SCHOOL-NORTH',
        schoolId: 'SCH-NT-NORTH',
        departmentId: 'DEPT-NORTH-OPS',
        recipientEmployeeId: null,
        createdById: northCampusHr.userId,
      },
      {
        memoId: 'MEMO-BASAK-OPS',
        memoType: 'Meeting Memo',
        title: 'Basak Ops Brief',
        content: 'Operations huddle at 9 AM tomorrow.',
        attachments: [],
        effectiveDate: CURRENT_DATE,
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-BASAK',
        schoolId: null,
        departmentId: null,
        recipientEmployeeId: null,
        createdById: basakCampusHr.userId,
      },
      {
        memoId: 'MEMO-QUAD-ADMIN',
        memoType: 'Policy Memo',
        title: 'Quad Admin Update',
        content: 'Please submit staffing requests by Friday.',
        attachments: [],
        effectiveDate: CURRENT_DATE,
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-QUAD',
        schoolId: null,
        departmentId: null,
        recipientEmployeeId: null,
        createdById: quadCampusHr.userId,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.subject.createMany({
    data: [
      {
        subjectId: 'SUBJ-CS101',
        code: 'CS101',
        name: 'Introduction to Computer Science',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
      },
      {
        subjectId: 'SUBJ-CS202',
        code: 'CS202',
        name: 'Data Structures',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.teachingAssignment.createMany({
    data: [
      {
        assignmentId: 'ASSIGN-JOHN-CS101',
        employeeId: john.userId,
        subjectId: 'SUBJ-CS101',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        startsOn: CURRENT_SCHOOL_YEAR_START,
      },
      {
        assignmentId: 'ASSIGN-JOHN-CS202',
        employeeId: john.userId,
        subjectId: 'SUBJ-CS202',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        startsOn: CURRENT_SCHOOL_YEAR_START,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.classSession.createMany({
    data: [
      {
        classSessionId: 'SESSION-CS101-2026-04-28',
        subjectId: 'SUBJ-CS101',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        sessionDate: CURRENT_DATE,
        startsAt: new Date(CURRENT_DATE.getTime() + 8 * 60 * 60 * 1000),
        endsAt: new Date(CURRENT_DATE.getTime() + 9 * 60 * 60 * 1000 + 30 * 60 * 1000),
        room: 'Room A-101',
      },
      {
        classSessionId: 'SESSION-CS202-2026-04-29',
        subjectId: 'SUBJ-CS202',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        sessionDate: NEXT_DATE,
        startsAt: new Date(NEXT_DATE.getTime() + 10 * 60 * 60 * 1000),
        endsAt: new Date(NEXT_DATE.getTime() + 11 * 60 * 60 * 1000 + 30 * 60 * 1000),
        room: 'Room B-204',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.teachingAttendance.createMany({
    data: [
      {
        attendanceId: 'TATT-JOHN-CS101-0428',
        employeeId: john.userId,
        classSessionId: 'SESSION-CS101-2026-04-28',
        status: 'LATE',
        remarks: 'Arrived 8 minutes late',
        minutesLate: 8,
      },
      {
        attendanceId: 'TATT-JOHN-CS202-0429',
        employeeId: john.userId,
        classSessionId: 'SESSION-CS202-2026-04-29',
        status: 'PRESENT',
        remarks: 'On time',
        minutesLate: null,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.nonTeachingAttendance.createMany({
    data: [
      {
        attendanceId: 'NTATT-MIA-2026-04-28',
        employeeId: mia.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-MAIN-REG',
        attendanceDate: CURRENT_DATE,
        status: 'LATE',
        checkInTime: new Date(CURRENT_DATE.getTime() + 9 * 60 * 60 * 1000 + 12 * 60 * 1000),
        checkOutTime: new Date(CURRENT_DATE.getTime() + 17 * 60 * 60 * 1000 + 5 * 60 * 1000),
        remarks: 'Traffic delay',
        minutesLate: 12,
      },
      {
        attendanceId: 'NTATT-MIA-2026-04-29',
        employeeId: mia.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-MAIN-REG',
        attendanceDate: NEXT_DATE,
        status: 'PRESENT',
        checkInTime: new Date(NEXT_DATE.getTime() + 8 * 60 * 60 * 1000 + 55 * 60 * 1000),
        checkOutTime: new Date(NEXT_DATE.getTime() + 17 * 60 * 60 * 1000 + 2 * 60 * 1000),
        minutesLate: null,
      },
      {
        attendanceId: 'NTATT-NINA-2026-04-28',
        employeeId: nina.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-OPS',
        attendanceDate: CURRENT_DATE,
        status: 'PRESENT',
        checkInTime: new Date(CURRENT_DATE.getTime() + 8 * 60 * 60 * 1000 + 55 * 60 * 1000),
        checkOutTime: new Date(CURRENT_DATE.getTime() + 17 * 60 * 60 * 1000 + 5 * 60 * 1000),
        minutesLate: null,
      },
      {
        attendanceId: 'NTATT-NINA-2026-04-29',
        employeeId: nina.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-OPS',
        attendanceDate: NEXT_DATE,
        status: 'LATE',
        checkInTime: new Date(NEXT_DATE.getTime() + 9 * 60 * 60 * 1000 + 18 * 60 * 1000),
        checkOutTime: new Date(NEXT_DATE.getTime() + 17 * 60 * 60 * 1000 + 10 * 60 * 1000),
        remarks: 'Traffic delay',
        minutesLate: 18,
      },
      {
        attendanceId: 'NTATT-BETH-2026-04-28',
        employeeId: beth.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
        attendanceDate: CURRENT_DATE,
        status: 'LATE',
        checkInTime: new Date(CURRENT_DATE.getTime() + 9 * 60 * 60 * 1000 + 20 * 60 * 1000),
        checkOutTime: new Date(CURRENT_DATE.getTime() + 17 * 60 * 60 * 1000 + 15 * 60 * 1000),
        remarks: 'Route delay',
        minutesLate: 20,
      },
      {
        attendanceId: 'NTATT-BETH-2026-04-29',
        employeeId: beth.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
        attendanceDate: NEXT_DATE,
        status: 'PRESENT',
        checkInTime: new Date(NEXT_DATE.getTime() + 8 * 60 * 60 * 1000 + 50 * 60 * 1000),
        checkOutTime: new Date(NEXT_DATE.getTime() + 17 * 60 * 60 * 1000 + 5 * 60 * 1000),
        minutesLate: null,
      },
      {
        attendanceId: 'NTATT-QUINCY-2026-04-28',
        employeeId: quincy.userId,
        schoolId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
        attendanceDate: CURRENT_DATE,
        status: 'LATE',
        checkInTime: new Date(CURRENT_DATE.getTime() + 9 * 60 * 60 * 1000 + 10 * 60 * 1000),
        checkOutTime: new Date(CURRENT_DATE.getTime() + 17 * 60 * 60 * 1000 + 12 * 60 * 1000),
        remarks: 'Transit delay',
        minutesLate: 10,
      },
      {
        attendanceId: 'NTATT-QUINCY-2026-04-29',
        employeeId: quincy.userId,
        schoolId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
        attendanceDate: NEXT_DATE,
        status: 'PRESENT',
        checkInTime: new Date(NEXT_DATE.getTime() + 8 * 60 * 60 * 1000 + 58 * 60 * 1000),
        checkOutTime: new Date(NEXT_DATE.getTime() + 17 * 60 * 60 * 1000 + 3 * 60 * 1000),
        minutesLate: null,
      },
    ],
    skipDuplicates: true,
  });

  const graphSeedStart = addDaysUtc(CURRENT_DATE, -29);
  const attendanceDates = Array.from({ length: 30 }, (_value, index) => addDaysUtc(graphSeedStart, index));

  const generatedSubjects: Array<{
    subjectId: string;
    code: string;
    name: string;
    schoolId: string;
    departmentId: string | null;
  }> = [];
  const subjectIdsByCampus = new Map<string, string[]>();

  for (const campus of campusConfigs) {
    const schoolId = campusSchoolMap.get(campus.campusId);
    if (!schoolId) {
      continue;
    }

    const subjectIds: string[] = [];

    campus.teachingDepartmentIds.forEach((departmentId, departmentIndex) => {
      for (let i = 0; i < 3; i += 1) {
        const subjectId = `${GENERATED_TEACHING_SUBJECT_PREFIX}${campus.code}-${departmentIndex}-${i + 1}`;
        const code = `${campus.code.toUpperCase()}-${departmentIndex + 1}${i + 1}01`;
        const name = `General Studies ${departmentIndex + 1}.${i + 1}`;

        generatedSubjects.push({
          subjectId,
          code,
          name,
          schoolId,
          departmentId,
        });
        subjectIds.push(subjectId);
      }
    });

    subjectIdsByCampus.set(campus.campusId, subjectIds);
  }

  await prisma.subject.createMany({
    data: generatedSubjects,
    skipDuplicates: true,
  });

  const generatedTeachingAssignments: Array<{
    assignmentId: string;
    employeeId: string;
    subjectId: string;
    schoolId: string;
    departmentId: string | null;
    startsOn: Date;
  }> = [];

  for (const campus of campusConfigs) {
    const schoolId = campusSchoolMap.get(campus.campusId);
    const campusSubjects = subjectIdsByCampus.get(campus.campusId) ?? [];
    const campusTeachers = teachingEmployeesByCampus[campus.campusId] ?? [];

    if (!schoolId || campusSubjects.length === 0 || campusTeachers.length === 0) {
      continue;
    }

    campusTeachers.forEach((teacher, index) => {
      const primarySubjectId = campusSubjects[index % campusSubjects.length];
      const secondarySubjectId = campusSubjects[(index + 1) % campusSubjects.length];
      const fallbackDepartmentId = campus.teachingDepartmentIds[index % campus.teachingDepartmentIds.length] ?? null;
      const departmentId = teacher.departmentId ?? fallbackDepartmentId;

      generatedTeachingAssignments.push({
        assignmentId: `ASSIGN-GEN-${campus.code}-${teacher.userId}-${primarySubjectId}`,
        employeeId: teacher.userId,
        subjectId: primarySubjectId,
        schoolId,
        departmentId,
        startsOn: CURRENT_SCHOOL_YEAR_START,
      });

      if (secondarySubjectId !== primarySubjectId) {
        generatedTeachingAssignments.push({
          assignmentId: `ASSIGN-GEN-${campus.code}-${teacher.userId}-${secondarySubjectId}`,
          employeeId: teacher.userId,
          subjectId: secondarySubjectId,
          schoolId,
          departmentId,
          startsOn: CURRENT_SCHOOL_YEAR_START,
        });
      }
    });
  }

  await prisma.teachingAssignment.createMany({
    data: generatedTeachingAssignments,
    skipDuplicates: true,
  });

  const generatedClassSessions: Array<{
    classSessionId: string;
    subjectId: string;
    schoolId: string;
    departmentId: string | null;
    sessionDate: Date;
    startsAt: Date;
    endsAt: Date;
    room: string | null;
  }> = [];
  const generatedTeachingAttendance: Array<{
    attendanceId: string;
    employeeId: string;
    classSessionId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    remarks: string | null;
    minutesLate: number | null;
  }> = [];

  for (const campus of campusConfigs) {
    const schoolId = campusSchoolMap.get(campus.campusId);
    const campusSubjects = subjectIdsByCampus.get(campus.campusId) ?? [];
    const campusTeachers = teachingEmployeesByCampus[campus.campusId] ?? [];
    if (!schoolId || campusSubjects.length === 0 || campusTeachers.length === 0) {
      continue;
    }
    const campusAssignments = generatedTeachingAssignments.filter((a) => a.schoolId === schoolId);
    const assignmentSchedules = campusAssignments.map((assignment, idx) => {
      const isMWF = idx % 2 === 0;
      const startHour = 1 + ((idx * 7) % 12);
      const durationMins = 60 * (1 + (idx % 3));
      const room = `Room ${campus.code.toUpperCase()}-${(idx % 20) + 1}`;
      return { ...assignment, isMWF, startHour, durationMins, room };
    });

    attendanceDates.forEach((attendanceDate, dayIndex) => {
      const dayOfWeek = attendanceDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return;

      const isTodayMWF = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
      const isTodayTTh = dayOfWeek === 2 || dayOfWeek === 4;

      const todaysSchedules = assignmentSchedules.filter(
        (s) => (s.isMWF && isTodayMWF) || (!s.isMWF && isTodayTTh),
      );

      todaysSchedules.forEach((schedule, sessionIndex) => {
        const sessionId = `${GENERATED_CLASS_SESSION_PREFIX}${campus.code}-${dayIndex}-${sessionIndex}`;
        const startsAt = new Date(attendanceDate.getTime() + schedule.startHour * 60 * 60 * 1000);
        const endsAt = new Date(
          attendanceDate.getTime() + schedule.startHour * 60 * 60 * 1000 + schedule.durationMins * 60 * 1000,
        );

        generatedClassSessions.push({
          classSessionId: sessionId,
          subjectId: schedule.subjectId,
          schoolId,
          departmentId: schedule.departmentId,
          sessionDate: attendanceDate,
          startsAt,
          endsAt,
          room: schedule.room,
        });

        const rand = Math.random();
        const isPresent = rand < 0.9;
        const isLate = isPresent && rand < 0.15;

        generatedTeachingAttendance.push({
          attendanceId: `${GENERATED_TEACHING_ATTENDANCE_PREFIX}${campus.code}-${dayIndex}-${sessionIndex}`,
          employeeId: schedule.employeeId,
          classSessionId: sessionId,
          status: isPresent ? (isLate ? 'LATE' : 'PRESENT') : 'ABSENT',
          remarks: isPresent ? (isLate ? 'Late arrival' : 'On time') : 'Absent',
          minutesLate: isLate ? 5 + Math.floor(Math.random() * 15) : null,
        });
      });
    });
  }

  await prisma.classSession.createMany({
    data: generatedClassSessions,
    skipDuplicates: true,
  });

  await prisma.teachingAttendance.createMany({
    data: generatedTeachingAttendance,
    skipDuplicates: true,
  });

  const generatedAttendance: Array<{
    attendanceId: string;
    employeeId: string;
    schoolId: string;
    departmentId: string | null;
    attendanceDate: Date;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    checkInTime: Date | null;
    checkOutTime: Date | null;
    remarks: string | null;
    minutesLate: number | null;
  }> = [];

  for (const campus of campusConfigs) {
    const campusEmployees = nonTeachingEmployeesByCampus[campus.campusId] ?? [];

    attendanceDates.forEach((attendanceDate, dayIndex) => {
      const presentTarget = Math.min(
        DAILY_PRESENT_COUNTS[dayIndex % DAILY_PRESENT_COUNTS.length],
        campusEmployees.length,
      );
      const absentTarget = Math.min(
        DAILY_ABSENT_COUNTS[dayIndex % DAILY_ABSENT_COUNTS.length],
        Math.max(0, campusEmployees.length - presentTarget),
      );
      const lateTarget = Math.min(DAILY_LATE_COUNTS[dayIndex % DAILY_LATE_COUNTS.length], presentTarget);
      const sliceEnd = Math.min(campusEmployees.length, presentTarget + absentTarget);
      const selected = campusEmployees.slice(0, sliceEnd);
      const presentEmployees = selected.slice(0, presentTarget);
      const absentEmployees = selected.slice(presentTarget, presentTarget + absentTarget);

      presentEmployees.forEach((employee, index) => {
        const isLate = index < lateTarget;
        const minutesLate = isLate ? 5 + (index % 25) : null;
        const checkInOffsetMinutes = isLate ? 60 + (index % 20) : 5 + (index % 20);

        generatedAttendance.push({
          attendanceId: `${GENERATED_ATTENDANCE_PREFIX}${campus.code}-${dayIndex}-${index}`,
          employeeId: employee.userId,
          schoolId: campus.campusId,
          departmentId: employee.departmentId,
          attendanceDate,
          status: isLate ? 'LATE' : 'PRESENT',
          checkInTime: new Date(attendanceDate.getTime() + 8 * 60 * 60 * 1000 + checkInOffsetMinutes * 60 * 1000),
          checkOutTime: new Date(attendanceDate.getTime() + 17 * 60 * 60 * 1000 + (index % 10) * 60 * 1000),
          remarks: isLate ? 'Delayed arrival' : null,
          minutesLate,
        });
      });

      absentEmployees.forEach((employee, index) => {
        generatedAttendance.push({
          attendanceId: `${GENERATED_ATTENDANCE_PREFIX}${campus.code}-${dayIndex}-A${index}`,
          employeeId: employee.userId,
          schoolId: campus.campusId,
          departmentId: employee.departmentId,
          attendanceDate,
          status: 'ABSENT',
          checkInTime: null,
          checkOutTime: null,
          remarks: 'Absent',
          minutesLate: null,
        });
      });
    });
  }

  await prisma.nonTeachingAttendance.createMany({
    data: generatedAttendance,
    skipDuplicates: true,
  });

  const teachingCriteriaBase = {
    schoolYear: '2025-2026',
    semester: '2nd Semester',
    sections: [
      {
        id: 'delivery',
        title: 'Instructional Delivery',
        criteria: [
          { id: 'delivery-1', label: 'Explains concepts clearly', score: 4.4 },
          { id: 'delivery-2', label: 'Connects topics to real scenarios', score: 4.3 },
        ],
      },
      {
        id: 'engagement',
        title: 'Learner Engagement',
        criteria: [
          { id: 'engagement-1', label: 'Encourages participation', score: 4.2 },
          { id: 'engagement-2', label: 'Provides timely feedback', score: 4.1 },
        ],
      },
      {
        id: 'professional',
        title: 'Professional Conduct',
        criteria: [
          { id: 'professional-1', label: 'Demonstrates preparedness', score: 4.5 },
          { id: 'professional-2', label: 'Maintains respectful classroom tone', score: 4.4 },
        ],
      },
    ],
    strongPoints: [
      'Clear lesson delivery and structured lab guidance.',
      'Responsive and timely feedback for learners.',
    ],
    improvements: [
      'Increase formative assessments during lab activities.',
      'Publish rubrics earlier in the semester.',
    ],
  };

  const nonTeachingCriteriaBase = {
    schoolYear: '2025-2026',
    semester: '2nd Semester',
    sections: [
      {
        id: 'service',
        title: 'Service Delivery',
        criteria: [
          { id: 'service-1', label: 'Completes tasks on time', score: 4.1 },
          { id: 'service-2', label: 'Maintains quality standards', score: 4.0 },
        ],
      },
      {
        id: 'coordination',
        title: 'Coordination',
        criteria: [
          { id: 'coordination-1', label: 'Communicates progress clearly', score: 4.2 },
          { id: 'coordination-2', label: 'Coordinates with stakeholders', score: 4.0 },
        ],
      },
      {
        id: 'compliance',
        title: 'Process Compliance',
        criteria: [
          { id: 'compliance-1', label: 'Follows approved procedures', score: 4.1 },
          { id: 'compliance-2', label: 'Keeps documentation complete', score: 4.3 },
        ],
      },
    ],
    strongPoints: [
      'Dependable turnaround for operational requests.',
      'Consistent compliance with reporting standards.',
    ],
    improvements: [
      'Provide more frequent updates for high-priority tasks.',
      'Improve handoff notes between shifts.',
    ],
  };

  type CriteriaOverrides = { schoolYear?: string; semester?: string };

  const randomizeSections = (sections: any[]) => {
    return sections.map((section) => ({
      ...section,
      criteria: section.criteria.map((c: any) => ({
        ...c,
        score: Number((3.5 + Math.random() * 1.5).toFixed(2)),
      })),
    }));
  };

  const buildTeachingCriteria = (
    subjectCode: string,
    subjectTitle: string,
    respondentCount: number,
    overrides: CriteriaOverrides = {},
  ) => ({
    ...teachingCriteriaBase,
    sections: randomizeSections(teachingCriteriaBase.sections),
    schoolYear: overrides.schoolYear ?? teachingCriteriaBase.schoolYear,
    semester: overrides.semester ?? teachingCriteriaBase.semester,
    subjectCode,
    subjectTitle,
    respondentCount,
  });

  const buildNonTeachingCriteria = (
    subjectCode: string,
    subjectTitle: string,
    respondentCount: number,
    overrides: CriteriaOverrides = {},
  ) => ({
    ...nonTeachingCriteriaBase,
    sections: randomizeSections(nonTeachingCriteriaBase.sections),
    schoolYear: overrides.schoolYear ?? nonTeachingCriteriaBase.schoolYear,
    semester: overrides.semester ?? nonTeachingCriteriaBase.semester,
    subjectCode,
    subjectTitle,
    respondentCount,
  });

  await prisma.performanceEvaluation.createMany({
    data: [
      {
        evaluationId: 'PERF-JOHN-2025-S1',
        employeeId: john.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('CS-101', 'Foundations of Computing', 30, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.25,
        notes: 'Clear foundational coverage and steady learner engagement.',
      },
      {
        evaluationId: 'PERF-JOHN-2025-S2',
        employeeId: john.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('CS-210', 'Algorithms and Data Structures', 28, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.31,
        notes: 'Strong logical pacing and clear assessment feedback.',
      },
      {
        evaluationId: 'PERF-JOHN-2025-SUM',
        employeeId: john.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('CS-320', 'Special Topics in AI', 22, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.18,
        notes: 'Well-received summer module with applied projects.',
      },
      {
        evaluationId: 'PERF-BM-2025-S1',
        employeeId: bmFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-BM-BA',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('BA-101', 'Principles of Management', 26, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.21,
        notes: 'Structured delivery with steady student participation.',
      },
      {
        evaluationId: 'PERF-BM-2025-S2',
        employeeId: bmFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-BM-BA',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('BA-205', 'Operations Management', 24, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.27,
        notes: 'Consistent engagement and clear case study guidance.',
      },
      {
        evaluationId: 'PERF-BM-2025-SUM',
        employeeId: bmFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-BM-BA',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('BA-310', 'Strategic Leadership Lab', 20, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.16,
        notes: 'Strong facilitation of accelerated learning modules.',
      },
      {
        evaluationId: 'PERF-EDU-2025-S1',
        employeeId: eduFaculty.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-EDU-ELEM',
        evaluatorId: basakCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('EDU-101', 'Foundations of Education', 25, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.29,
        notes: 'Positive classroom management and cohesive lesson plans.',
      },
      {
        evaluationId: 'PERF-EDU-2025-S2',
        employeeId: eduFaculty.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-EDU-ELEM',
        evaluatorId: basakCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('EDU-210', 'Curriculum Design', 23, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.22,
        notes: 'Clear differentiation strategies and active coaching.',
      },
      {
        evaluationId: 'PERF-EDU-2025-SUM',
        employeeId: eduFaculty.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-EDU-ELEM',
        evaluatorId: basakCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('EDU-320', 'Educational Technology', 21, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.14,
        notes: 'Engaging summer modules with tech-enabled activities.',
      },
      {
        evaluationId: 'PERF-ENG-2025-S1',
        employeeId: engFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ENG',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('ENG-101', 'Engineering Fundamentals', 27, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.23,
        notes: 'Solid lab integration and structured assessments.',
      },
      {
        evaluationId: 'PERF-ENG-2025-S2',
        employeeId: engFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ENG',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('ENG-210', 'Applied Mechanics', 26, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.19,
        notes: 'Improved pacing for complex problem sets.',
      },
      {
        evaluationId: 'PERF-ENG-2025-SUM',
        employeeId: engFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ENG',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('ENG-315', 'Design Studio', 19, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.11,
        notes: 'Effective summer studio mentoring and critique sessions.',
      },
      {
        evaluationId: 'PERF-ARTS-2025-S1',
        employeeId: artsFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ARTS-BIO',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('BIO-101', 'General Biology', 29, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.24,
        notes: 'High student satisfaction with lab clarity.',
      },
      {
        evaluationId: 'PERF-ARTS-2025-S2',
        employeeId: artsFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ARTS-BIO',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('BIO-210', 'Ecology', 27, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.20,
        notes: 'Strong fieldwork coordination and feedback loops.',
      },
      {
        evaluationId: 'PERF-ARTS-2025-SUM',
        employeeId: artsFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ARTS-BIO',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('BIO-315', 'Field Biology Practicum', 18, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.12,
        notes: 'Hands-on practicum delivered with strong facilitation.',
      },
      {
        evaluationId: 'PERF-NORTH-2025-S1',
        employeeId: northFaculty.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-BUS-BA',
        evaluatorId: northCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('NTH-BA-101', 'Business Foundations', 24, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.17,
        notes: 'Good mix of theory and practical case work.',
      },
      {
        evaluationId: 'PERF-NORTH-2025-S2',
        employeeId: northFaculty.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-BUS-BA',
        evaluatorId: northCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('NTH-BA-202', 'Marketing Strategy', 23, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.13,
        notes: 'Active classroom discussion with solid project outputs.',
      },
      {
        evaluationId: 'PERF-NORTH-2025-SUM',
        employeeId: northFaculty.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-BUS-BA',
        evaluatorId: northCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('NTH-BA-310', 'Retail Analytics', 18, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.09,
        notes: 'Compact summer cohort with practical assignments.',
      },
      {
        evaluationId: 'PERF-QUAD-2025-S1',
        employeeId: quadFaculty.userId,
        schoolId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-SCI-AS',
        evaluatorId: quadCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_FIRST_START,
        periodEnd: SCHOOL_YEAR_2024_2025_FIRST_END,
        criteria: buildTeachingCriteria('QUAD-AS-101', 'Applied Science Lab', 22, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_FIRST,
        }),
        overallScore: 4.18,
        notes: 'Hands-on lab emphasis with clear safety protocols.',
      },
      {
        evaluationId: 'PERF-QUAD-2025-S2',
        employeeId: quadFaculty.userId,
        schoolId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-SCI-AS',
        evaluatorId: quadCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SECOND_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SECOND_END,
        criteria: buildTeachingCriteria('QUAD-AS-210', 'Applied Chemistry', 21, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SECOND,
        }),
        overallScore: 4.14,
        notes: 'Clear lab demonstrations and structured assessments.',
      },
      {
        evaluationId: 'PERF-QUAD-2025-SUM',
        employeeId: quadFaculty.userId,
        schoolId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-SCI-AS',
        evaluatorId: quadCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: SCHOOL_YEAR_2024_2025_SUMMER_START,
        periodEnd: SCHOOL_YEAR_2024_2025_SUMMER_END,
        criteria: buildTeachingCriteria('QUAD-AS-315', 'Field Research Practicum', 17, {
          schoolYear: SCHOOL_YEAR_2024_2025,
          semester: SEMESTER_SUMMER,
        }),
        overallScore: 4.07,
        notes: 'Engaging summer projects with consistent mentoring.',
      },
      {
        evaluationId: 'PERF-JOHN-2026-Q2',
        employeeId: john.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: buildTeachingCriteria('TEACH-PRF', 'Teaching Performance Review', 28),
        overallScore: 4.32,
        notes: 'Consistent classroom performance with strong student feedback.',
      },
      {
        evaluationId: 'PERF-BM-2026-Q2',
        employeeId: bmFaculty.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-BM-BA',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: buildTeachingCriteria('TEACH-PRF-BM', 'Business Management Review', 24),
        overallScore: 4.28,
        notes: 'Steady delivery and engagement across courses.',
      },
      {
        evaluationId: 'PERF-EDU-2026-Q2',
        employeeId: eduFaculty.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-EDU-ELEM',
        evaluatorId: basakCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: buildTeachingCriteria('TEACH-PRF-EDU', 'Education Faculty Review', 26),
        overallScore: 4.30,
        notes: 'Positive classroom management and strong rapport.',
      },
      {
        evaluationId: 'PERF-MIA-2026-Q2',
        employeeId: mia.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-MAIN-REG',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'NON_TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: buildNonTeachingCriteria('OPS-PRF', 'Operational Performance Review', 20),
        overallScore: 4.12,
        notes: 'Reliable operational support with quick turnarounds.',
      },
      {
        evaluationId: 'PERF-NINA-2026-Q2',
        employeeId: nina.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-NORTH-OPS',
        evaluatorId: northCampusHr.userId,
        rubricType: 'NON_TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: buildNonTeachingCriteria('OPS-PRF-N', 'Operations Performance Review', 22),
        overallScore: 4.08,
        notes: 'Strong compliance discipline and clear communication.',
      },
      {
        evaluationId: 'PERF-BETH-2026-Q2',
        employeeId: beth.userId,
        schoolId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
        evaluatorId: basakCampusHr.userId,
        rubricType: 'NON_TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: buildNonTeachingCriteria('OPS-PRF-B', 'Campus Operations Review', 18),
        overallScore: 4.05,
        notes: 'Dependable service delivery with steady improvements.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
  console.log('Credentials:');
  console.log(`- head.hr@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- campus.hr.main@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- campus.hr.north@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- campus.hr.basak@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- campus.hr.quad@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.teaching@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.main.staff@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.staff@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.basak.staff@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.quad.staff@school.com / ${DEFAULT_PASSWORD}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
