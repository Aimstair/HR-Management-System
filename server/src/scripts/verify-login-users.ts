import { prisma } from '../lib/prisma.js';
import { verifyPassword } from '../lib/password.js';

const emails = [
  'head.hr@school.com',
  'campus.hr.main@school.com',
  'campus.hr.north@school.com',
  'employee.teaching@school.com',
  'employee.staff@school.com',
];

const run = async (): Promise<void> => {
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: {
      email: true,
      role: true,
      employeeType: true,
      isActive: true,
      passwordHash: true,
    },
  });

  const byEmail = new Map(users.map((u) => [u.email, u]));

  for (const email of emails) {
    const user = byEmail.get(email);
    if (!user) {
      console.log(`MISSING ${email}`);
      continue;
    }

    const passwordOk = await verifyPassword('Password123!', user.passwordHash);
    console.log(`OK ${email} role=${user.role} type=${user.employeeType} active=${user.isActive} password=${passwordOk}`);
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
