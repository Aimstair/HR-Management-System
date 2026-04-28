import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/password.js';

const DEFAULT_PASSWORD = 'Password123!';

const run = async (): Promise<void> => {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const campuses = [
    { campusId: 'SCHOOL-MAIN', name: 'Main Campus', code: 'MAIN' },
    { campusId: 'SCHOOL-NORTH', name: 'North Campus', code: 'NORTH' },
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
  ];

  const createdUsers: Record<string, { id: string }> = {};

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

    createdUsers[user.email] = { id: created.id };
  }

  const john = createdUsers['employee.teaching@school.com'];
  const nina = createdUsers['employee.staff@school.com'];
  const mainCampusHr = createdUsers['campus.hr.main@school.com'];
  const northCampusHr = createdUsers['campus.hr.north@school.com'];

  await prisma.requestRecord.createMany({
    data: [
      {
        id: 'REQ-LEAVE-JOHN',
        type: 'LEAVE',
        status: 'PENDING',
        title: 'Leave Request - John Doe',
        description: 'Family event leave',
        employeeId: john.id,
        reviewedById: null,
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
      },
      {
        id: 'REQ-EXPENSE-NINA',
        type: 'EXPENSE',
        status: 'APPROVED',
        title: 'Expense Request - Nina North',
        description: 'Course materials reimbursement',
        employeeId: nina.id,
        reviewedById: northCampusHr.id,
        campusId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.shift.createMany({
    data: [
      {
        id: 'SHIFT-MAIN-MORNING',
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        createdById: mainCampusHr.id,
      },
      {
        id: 'SHIFT-NORTH-LATE',
        name: 'Late Shift',
        startTime: '10:00',
        endTime: '18:00',
        campusId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
        createdById: northCampusHr.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.memo.createMany({
    data: [
      {
        id: 'MEMO-MAIN-MEETING',
        title: 'Main Campus Meeting',
        content: 'Faculty meeting this Friday at 3 PM.',
        scopeType: 'SCHOOL',
        campusId: 'SCHOOL-MAIN',
        departmentId: null,
        createdById: mainCampusHr.id,
      },
      {
        id: 'MEMO-CS-CHECKLIST',
        title: 'CS Department Checklist',
        content: 'Submit semester grading templates by Monday.',
        scopeType: 'DEPARTMENT',
        campusId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        createdById: mainCampusHr.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.subject.createMany({
    data: [
      {
        id: 'SUBJ-CS101',
        code: 'CS101',
        name: 'Introduction to Computer Science',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
      },
      {
        id: 'SUBJ-CS202',
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
        id: 'ASSIGN-JOHN-CS101',
        employeeId: john.id,
        subjectId: 'SUBJ-CS101',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        startsOn: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'ASSIGN-JOHN-CS202',
        employeeId: john.id,
        subjectId: 'SUBJ-CS202',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        startsOn: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.classSession.createMany({
    data: [
      {
        id: 'SESSION-CS101-2026-04-20',
        subjectId: 'SUBJ-CS101',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        sessionDate: new Date('2026-04-20T00:00:00.000Z'),
        startsAt: new Date('2026-04-20T08:00:00.000Z'),
        endsAt: new Date('2026-04-20T09:30:00.000Z'),
        room: 'Room A-101',
      },
      {
        id: 'SESSION-CS202-2026-04-21',
        subjectId: 'SUBJ-CS202',
        schoolId: 'SCH-ENG',
        departmentId: 'DEPT-CS',
        sessionDate: new Date('2026-04-21T00:00:00.000Z'),
        startsAt: new Date('2026-04-21T10:00:00.000Z'),
        endsAt: new Date('2026-04-21T11:30:00.000Z'),
        room: 'Room B-204',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.teachingAttendance.createMany({
    data: [
      {
        id: 'TATT-JOHN-CS101-0420',
        employeeId: john.id,
        classSessionId: 'SESSION-CS101-2026-04-20',
        status: 'PRESENT',
        remarks: 'On time',
      },
      {
        id: 'TATT-JOHN-CS202-0421',
        employeeId: john.id,
        classSessionId: 'SESSION-CS202-2026-04-21',
        status: 'LATE',
        remarks: 'Arrived 8 minutes late',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.nonTeachingAttendance.createMany({
    data: [
      {
        id: 'NTATT-NINA-2026-04-20',
        employeeId: nina.id,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
        attendanceDate: new Date('2026-04-20T00:00:00.000Z'),
        status: 'PRESENT',
        checkInTime: new Date('2026-04-20T08:55:00.000Z'),
        checkOutTime: new Date('2026-04-20T17:05:00.000Z'),
      },
      {
        id: 'NTATT-NINA-2026-04-21',
        employeeId: nina.id,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
        attendanceDate: new Date('2026-04-21T00:00:00.000Z'),
        status: 'LATE',
        checkInTime: new Date('2026-04-21T09:18:00.000Z'),
        checkOutTime: new Date('2026-04-21T17:10:00.000Z'),
        remarks: 'Traffic delay',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.performanceEvaluation.createMany({
    data: [
      {
        id: 'PERF-JOHN-2026-Q1',
        employeeId: john.id,
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        evaluatorId: mainCampusHr.id,
        rubricType: 'TEACHING',
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T23:59:59.000Z'),
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
        id: 'PERF-NINA-2026-Q1',
        employeeId: nina.id,
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
        evaluatorId: northCampusHr.id,
        rubricType: 'NON_TEACHING',
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T23:59:59.000Z'),
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
  console.log(`- employee.teaching@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.staff@school.com / ${DEFAULT_PASSWORD}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
