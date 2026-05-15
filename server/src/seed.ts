import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/password.js';

const DEFAULT_PASSWORD = 'Password123!';
const NOW = new Date();
const CURRENT_DATE = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()));
const NEXT_DATE = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate() + 1));
const CURRENT_PERIOD_START = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), 1));
const CURRENT_PERIOD_END = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate(), 23, 59, 59));
const CURRENT_SCHOOL_YEAR_START = new Date(Date.UTC(NOW.getUTCFullYear(), 0, 1));
const GENERATED_EMPLOYEE_TARGET = 120;
const GENERATED_TEACHING_EMPLOYEE_TARGET = 30;
const GENERATED_ON_LEAVE_COUNT = 60;
const GENERATED_PENDING_PER_TYPE = 15;
const GENERATED_REQUEST_TYPES = ['LEAVE', 'UNDERTIME', 'OVERTIME', 'WFH', 'TIME_ADJUSTMENT'] as const;
const GENERATED_REQUEST_PREFIX = 'REQ-GEN-';
const GENERATED_ATTENDANCE_PREFIX = 'NTATT-GEN-';
const GENERATED_TEACHING_SUBJECT_PREFIX = 'SUBJ-GEN-';
const GENERATED_CLASS_SESSION_PREFIX = 'SESSION-GEN-';
const GENERATED_TEACHING_ATTENDANCE_PREFIX = 'TATT-GEN-';
const DAILY_PRESENT_COUNTS = [70, 65, 60, 68, 62, 55, 60];
const DAILY_ABSENT_COUNTS = [50, 55, 60, 52, 58, 65, 60];
const DAILY_LATE_COUNTS = [50, 30, 28, 32, 34, 40, 45];
const TEACHING_DAILY_PRESENT_COUNTS = [55, 58, 60, 62, 57, 59, 61];
const TEACHING_DAILY_ABSENT_COUNTS = [10, 12, 9, 11, 10, 12, 9];

const run = async (): Promise<void> => {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const campuses = [
    { campusId: 'SCHOOL-MAIN', name: 'Main Campus', code: 'MAIN' },
    { campusId: 'SCHOOL-NORTH', name: 'North Campus', code: 'NORTH' },
    { campusId: 'SCHOOL-BASAK', name: 'Basak Campus', code: 'BASAK' },
    { campusId: 'SCHOOL-QUAD', name: 'Quadricentennial Campus', code: 'QUAD' },
  ];

  for (const campus of campuses) {
    await prisma.campus.upsert({
      where: { campusId: campus.campusId },
      update: campus,
      create: campus,
    });
  }

  const schools = [
    { schoolId: 'SCH-ENG', name: 'School of Engineering', campusId: 'SCHOOL-MAIN' },
    { schoolId: 'SCH-ARTS', name: 'School of Arts and Sciences', campusId: 'SCHOOL-MAIN' },
    { schoolId: 'SCH-BUS', name: 'School of Business', campusId: 'SCHOOL-NORTH' },
    { schoolId: 'SCH-BASAK-BUS', name: 'School of Business - Basak', campusId: 'SCHOOL-BASAK' },
    { schoolId: 'SCH-QUAD-SCI', name: 'School of Science - Quadricentennial', campusId: 'SCHOOL-QUAD' },
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { schoolId: school.schoolId },
      update: school,
      create: school,
    });
  }

  const departments = [
    { departmentId: 'DEPT-CS', name: 'Computer Science', schoolId: 'SCH-ENG' },
    { departmentId: 'DEPT-HR', name: 'Human Resources', schoolId: 'SCH-BUS' },
    { departmentId: 'DEPT-ENG', name: 'Engineering', schoolId: 'SCH-ENG' },
    { departmentId: 'DEPT-BASAK-HR', name: 'Human Resources', schoolId: 'SCH-BASAK-BUS' },
    { departmentId: 'DEPT-BASAK-OPS', name: 'Operations', schoolId: 'SCH-BASAK-BUS' },
    { departmentId: 'DEPT-QUAD-HR', name: 'Human Resources', schoolId: 'SCH-QUAD-SCI' },
    { departmentId: 'DEPT-QUAD-ADM', name: 'Administration', schoolId: 'SCH-QUAD-SCI' },
  ];

  const campusNameMap = new Map(campuses.map((campus) => [campus.campusId, campus.name]));
  const departmentNameMap = new Map(departments.map((department) => [department.departmentId, department.name]));
  const campusSchoolMap = new Map([
    ['SCHOOL-MAIN', 'SCH-ENG'],
    ['SCHOOL-NORTH', 'SCH-BUS'],
    ['SCHOOL-BASAK', 'SCH-BASAK-BUS'],
    ['SCHOOL-QUAD', 'SCH-QUAD-SCI'],
  ]);
  const campusConfigs = [
    {
      campusId: 'SCHOOL-MAIN',
      code: 'main',
      departmentIds: ['DEPT-CS', 'DEPT-ENG'],
    },
    {
      campusId: 'SCHOOL-NORTH',
      code: 'north',
      departmentIds: ['DEPT-ENG'],
    },
    {
      campusId: 'SCHOOL-BASAK',
      code: 'basak',
      departmentIds: ['DEPT-BASAK-HR', 'DEPT-BASAK-OPS'],
    },
    {
      campusId: 'SCHOOL-QUAD',
      code: 'quad',
      departmentIds: ['DEPT-QUAD-HR', 'DEPT-QUAD-ADM'],
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
      email: 'employee.main.staff@school.com',
      firstName: 'Mia',
      lastName: 'Lopez',
      role: 'ROLE_EMPLOYEE' as const,
      employeeType: 'NON_TEACHING' as const,
      department: 'Engineering',
      schoolBranch: 'Main Campus',
      position: 'Registrar Assistant',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-ENG',
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
      department: 'Engineering',
      schoolBranch: 'North Campus',
      position: 'Registrar Assistant',
      schoolId: 'SCHOOL-NORTH',
      departmentId: 'DEPT-ENG',
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
  const mia = createdUsers['employee.main.staff@school.com'];
  const nina = createdUsers['employee.staff@school.com'];
  const beth = createdUsers['employee.basak.staff@school.com'];
  const quincy = createdUsers['employee.quad.staff@school.com'];
  const mainCampusHr = createdUsers['campus.hr.main@school.com'];
  const northCampusHr = createdUsers['campus.hr.north@school.com'];
  const basakCampusHr = createdUsers['campus.hr.basak@school.com'];
  const quadCampusHr = createdUsers['campus.hr.quad@school.com'];

  const employeesByCampus: Record<string, Array<{ userId: string; departmentId: string | null }>> = {
    'SCHOOL-MAIN': [{ userId: mia.userId, departmentId: 'DEPT-ENG' }],
    'SCHOOL-NORTH': [{ userId: nina.userId, departmentId: 'DEPT-ENG' }],
    'SCHOOL-BASAK': [{ userId: beth.userId, departmentId: 'DEPT-BASAK-OPS' }],
    'SCHOOL-QUAD': [{ userId: quincy.userId, departmentId: 'DEPT-QUAD-ADM' }],
  };

  for (const campus of campusConfigs) {
    const existing = employeesByCampus[campus.campusId] ?? [];
    const needed = Math.max(0, GENERATED_EMPLOYEE_TARGET - existing.length);

    for (let i = 0; i < needed; i += 1) {
      const departmentId = campus.departmentIds[i % campus.departmentIds.length];
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
    'SCHOOL-MAIN': [{ userId: john.userId, departmentId: 'DEPT-CS' }],
    'SCHOOL-NORTH': [],
    'SCHOOL-BASAK': [],
    'SCHOOL-QUAD': [],
  };

  for (const campus of campusConfigs) {
    const existing = teachingEmployeesByCampus[campus.campusId] ?? [];
    const needed = Math.max(0, GENERATED_TEACHING_EMPLOYEE_TARGET - existing.length);

    for (let i = 0; i < needed; i += 1) {
      const departmentId = campus.departmentIds[i % campus.departmentIds.length];
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
        in: ['PERF-JOHN-2026-Q2', 'PERF-NINA-2026-Q2'],
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
        in: ['MEMO-MAIN-MEETING', 'MEMO-CS-CHECKLIST', 'MEMO-BASAK-OPS', 'MEMO-QUAD-ADMIN'],
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
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: mia.userId,
        reviewedById: mainCampusHr.userId,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-ENG',
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
        departmentId: 'DEPT-ENG',
      },
      {
        requestId: 'REQ-OVERTIME-JOHN',
        type: 'OVERTIME',
        status: 'PENDING',
        title: 'Overtime Request - John Doe',
        description: 'Exam preparation support',
        employeeId: john.userId,
        reviewedById: null,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
      },
      {
        requestId: 'REQ-WFH-JOHN',
        type: 'WFH',
        status: 'PENDING',
        title: 'Work from Home Request - John Doe',
        description: 'Work from home request',
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
        employeeId: nina.userId,
        reviewedById: northCampusHr.userId,
        campusId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
      },
      {
        requestId: 'REQ-LEAVE-BETH-APPROVED',
        type: 'LEAVE',
        status: 'APPROVED',
        title: 'Leave Request - Beth Santos',
        description: 'Family travel leave',
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
        employeeId: beth.userId,
        reviewedById: null,
        campusId: 'SCHOOL-BASAK',
        departmentId: 'DEPT-BASAK-OPS',
      },
      {
        requestId: 'REQ-WFH-BETH',
        type: 'WFH',
        status: 'PENDING',
        title: 'Work from Home Request - Beth Santos',
        description: 'Work from home request',
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
        employeeId: quincy.userId,
        reviewedById: null,
        campusId: 'SCHOOL-QUAD',
        departmentId: 'DEPT-QUAD-ADM',
      },
      {
        requestId: 'REQ-WFH-QUINCY',
        type: 'WFH',
        status: 'PENDING',
        title: 'Work from Home Request - Quincy Reyes',
        description: 'Work from home request',
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
    type: 'LEAVE' | 'UNDERTIME' | 'OVERTIME' | 'WFH' | 'TIME_ADJUSTMENT';
    status: 'PENDING' | 'APPROVED';
    title: string;
    description: string;
    leaveStartDate?: Date;
    leaveEndDate?: Date;
    employeeId: string;
    reviewedById: string | null;
    campusId: string;
    departmentId: string | null;
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
        leaveStartDate: CURRENT_DATE,
        leaveEndDate: NEXT_DATE,
        employeeId: employee.userId,
        reviewedById: approver?.userId ?? null,
        campusId: campus.campusId,
        departmentId: employee.departmentId,
      });
    }

    GENERATED_REQUEST_TYPES.forEach((type, typeIndex) => {
      const requestLabel =
        type === 'WFH'
          ? 'Work from Home'
          : type === 'TIME_ADJUSTMENT'
            ? 'Time Adjustment'
            : type.replace('_', ' ');
      const requestDescription =
        type === 'WFH'
          ? 'work from home'
          : type === 'TIME_ADJUSTMENT'
            ? 'time adjustment'
            : type.replace('_', ' ').toLowerCase();
      for (let i = 0; i < GENERATED_PENDING_PER_TYPE; i += 1) {
        const employee = campusEmployees[(typeIndex * GENERATED_PENDING_PER_TYPE + i) % campusEmployees.length];
        const titleSuffix = String(i + 1).padStart(3, '0');

        generatedRequests.push({
          requestId: `${GENERATED_REQUEST_PREFIX}${campus.code}-${type.toLowerCase()}-${titleSuffix}`,
          type,
          status: 'PENDING',
          title: `Pending ${requestLabel} ${campus.code.toUpperCase()} ${titleSuffix}`,
          description: `Pending ${requestDescription} request`,
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
        departmentId: 'DEPT-ENG',
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
        memoId: 'MEMO-MAIN-MEETING',
        title: 'Main Campus Meeting',
        content: 'Faculty meeting this Friday at 3 PM.',
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-MAIN',
        departmentId: null,
        createdById: mainCampusHr.userId,
      },
      {
        memoId: 'MEMO-CS-CHECKLIST',
        title: 'CS Department Checklist',
        content: 'Submit semester grading templates by Monday.',
        scopeType: 'DEPARTMENT',
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        createdById: mainCampusHr.userId,
      },
      {
        memoId: 'MEMO-BASAK-OPS',
        title: 'Basak Ops Brief',
        content: 'Operations huddle at 9 AM tomorrow.',
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-BASAK',
        departmentId: null,
        createdById: basakCampusHr.userId,
      },
      {
        memoId: 'MEMO-QUAD-ADMIN',
        title: 'Quad Admin Update',
        content: 'Please submit staffing requests by Friday.',
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-QUAD',
        departmentId: null,
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
        departmentId: 'DEPT-ENG',
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
        departmentId: 'DEPT-ENG',
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
        departmentId: 'DEPT-ENG',
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
        departmentId: 'DEPT-ENG',
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

  const attendanceDates = Array.from({ length: 7 }, (_value, index) => {
    const date = new Date(CURRENT_DATE);
    date.setUTCDate(CURRENT_DATE.getUTCDate() - index);
    return date;
  });

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

    campus.departmentIds.forEach((departmentId, departmentIndex) => {
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

    attendanceDates.forEach((attendanceDate, dayIndex) => {
      const presentTarget = TEACHING_DAILY_PRESENT_COUNTS[dayIndex];
      const absentTarget = TEACHING_DAILY_ABSENT_COUNTS[dayIndex];
      const totalSessions = presentTarget + absentTarget;

      for (let sessionIndex = 0; sessionIndex < totalSessions; sessionIndex += 1) {
        const isPresent = sessionIndex < presentTarget;
        const isLate = isPresent && sessionIndex % 6 === 0;
        const subjectId = campusSubjects[sessionIndex % campusSubjects.length];
        const teacher = campusTeachers[sessionIndex % campusTeachers.length];
        const departmentId = campus.departmentIds[sessionIndex % campus.departmentIds.length] ?? null;
        const sessionId = `${GENERATED_CLASS_SESSION_PREFIX}${campus.code}-${dayIndex}-${sessionIndex}`;
        const startHour = 7 + (sessionIndex % 8);
        const startsAt = new Date(attendanceDate.getTime() + startHour * 60 * 60 * 1000);
        const endsAt = new Date(attendanceDate.getTime() + (startHour + 1) * 60 * 60 * 1000 + 30 * 60 * 1000);

        generatedClassSessions.push({
          classSessionId: sessionId,
          subjectId,
          schoolId,
          departmentId,
          sessionDate: attendanceDate,
          startsAt,
          endsAt,
          room: `Room ${campus.code.toUpperCase()}-${(sessionIndex % 20) + 1}`,
        });

        generatedTeachingAttendance.push({
          attendanceId: `${GENERATED_TEACHING_ATTENDANCE_PREFIX}${campus.code}-${dayIndex}-${sessionIndex}`,
          employeeId: teacher.userId,
          classSessionId: sessionId,
          status: isPresent ? (isLate ? 'LATE' : 'PRESENT') : 'ABSENT',
          remarks: isPresent ? (isLate ? 'Late arrival' : 'On time') : 'Absent',
          minutesLate: isLate ? 5 + (sessionIndex % 15) : null,
        });
      }
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
      const presentTarget = Math.min(DAILY_PRESENT_COUNTS[dayIndex], campusEmployees.length);
      const absentTarget = Math.min(
        DAILY_ABSENT_COUNTS[dayIndex],
        Math.max(0, campusEmployees.length - presentTarget),
      );
      const lateTarget = Math.min(DAILY_LATE_COUNTS[dayIndex], presentTarget);
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

  await prisma.performanceEvaluation.createMany({
    data: [
      {
        evaluationId: 'PERF-JOHN-2026-Q2',
        employeeId: john.userId,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        evaluatorId: mainCampusHr.userId,
        rubricType: 'TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: {
          classroomDelivery: 4.6,
          learnerEngagement: 4.4,
          assessmentQuality: 4.5,
          professionalConduct: 4.7,
        },
        overallScore: 4.55,
        notes: 'Consistent classroom performance with strong student feedback.',
      },
      {
        evaluationId: 'PERF-NINA-2026-Q2',
        employeeId: nina.userId,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
        evaluatorId: northCampusHr.userId,
        rubricType: 'NON_TEACHING',
        periodStart: CURRENT_PERIOD_START,
        periodEnd: CURRENT_PERIOD_END,
        criteria: {
          serviceDelivery: 4.3,
          processCompliance: 4.6,
          teamwork: 4.4,
          punctuality: 4.2,
        },
        overallScore: 4.38,
        notes: 'Reliable operational support with strong compliance discipline.',
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
