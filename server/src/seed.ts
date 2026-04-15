import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/password.js';

const DEFAULT_PASSWORD = 'Password123!';

const run = async (): Promise<void> => {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const schools = [
    { id: 'SCHOOL-MAIN', name: 'Main Campus', code: 'MAIN' },
    { id: 'SCHOOL-NORTH', name: 'North Campus', code: 'NORTH' },
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { id: school.id },
      update: school,
      create: school,
    });
  }

  const departments = [
    { id: 'DEPT-CS', name: 'Computer Science', schoolId: 'SCHOOL-MAIN' },
    { id: 'DEPT-HR', name: 'Human Resources', schoolId: 'SCHOOL-MAIN' },
    { id: 'DEPT-ENG', name: 'Engineering', schoolId: 'SCHOOL-NORTH' },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { id: department.id },
      update: department,
      create: department,
    });
  }

  const users = [
    {
      email: 'head.admin@school.com',
      firstName: 'Harriet',
      lastName: 'Head',
      role: 'ROLE_HEAD_ADMIN' as const,
      department: 'Executive Office',
      schoolBranch: 'All Campuses',
      position: 'Head Administrator',
      schoolId: null,
      departmentId: null,
      adminScopeType: 'GLOBAL' as const,
      adminSchoolId: null,
      adminSchoolName: null,
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'school.admin@school.com',
      firstName: 'Sam',
      lastName: 'School',
      role: 'ROLE_SCHOOL_ADMIN' as const,
      department: 'Operations',
      schoolBranch: 'Main Campus',
      position: 'School Administrator',
      schoolId: 'SCHOOL-MAIN',
      departmentId: null,
      adminScopeType: 'SCHOOL' as const,
      adminSchoolId: 'SCHOOL-MAIN',
      adminSchoolName: 'Main Campus',
      adminDepartmentId: null,
      adminDepartmentName: null,
    },
    {
      email: 'dept.admin@school.com',
      firstName: 'Dana',
      lastName: 'Department',
      role: 'ROLE_DEPARTMENT_ADMIN' as const,
      department: 'Computer Science',
      schoolBranch: 'Main Campus',
      position: 'Department Administrator',
      schoolId: 'SCHOOL-MAIN',
      departmentId: 'DEPT-CS',
      adminScopeType: 'DEPARTMENT' as const,
      adminSchoolId: 'SCHOOL-MAIN',
      adminSchoolName: 'Main Campus',
      adminDepartmentId: 'DEPT-CS',
      adminDepartmentName: 'Computer Science',
    },
    {
      email: 'employee@school.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ROLE_EMPLOYEE' as const,
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
      email: 'employee.north@school.com',
      firstName: 'Nina',
      lastName: 'North',
      role: 'ROLE_EMPLOYEE' as const,
      department: 'Engineering',
      schoolBranch: 'North Campus',
      position: 'Instructor',
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

  const john = createdUsers['employee@school.com'];
  const nina = createdUsers['employee.north@school.com'];
  const schoolAdmin = createdUsers['school.admin@school.com'];

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
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
      },
      {
        id: 'REQ-EXPENSE-NINA',
        type: 'EXPENSE',
        status: 'APPROVED',
        title: 'Expense Request - Nina North',
        description: 'Course materials reimbursement',
        employeeId: nina.id,
        reviewedById: schoolAdmin.id,
        schoolId: 'SCHOOL-NORTH',
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
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        createdById: schoolAdmin.id,
      },
      {
        id: 'SHIFT-NORTH-LATE',
        name: 'Late Shift',
        startTime: '10:00',
        endTime: '18:00',
        schoolId: 'SCHOOL-NORTH',
        departmentId: 'DEPT-ENG',
        createdById: schoolAdmin.id,
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
        schoolId: 'SCHOOL-MAIN',
        departmentId: null,
        createdById: schoolAdmin.id,
      },
      {
        id: 'MEMO-CS-CHECKLIST',
        title: 'CS Department Checklist',
        content: 'Submit semester grading templates by Monday.',
        scopeType: 'DEPARTMENT',
        schoolId: 'SCHOOL-MAIN',
        departmentId: 'DEPT-CS',
        createdById: schoolAdmin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
  console.log('Credentials:');
  console.log(`- head.admin@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- school.admin@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- dept.admin@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee@school.com / ${DEFAULT_PASSWORD}`);
  console.log(`- employee.north@school.com / ${DEFAULT_PASSWORD}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
