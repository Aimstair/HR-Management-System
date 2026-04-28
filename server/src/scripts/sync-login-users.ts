import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';

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

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        ...user,
        passwordHash,
        isActive: true,
      },
      create: {
        ...user,
        passwordHash,
        isActive: true,
      },
    });
  }

  console.log('Core login users synced.');
  console.log('Password for all users: Password123!');
  for (const user of users) {
    console.log(`- ${user.email}`);
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
