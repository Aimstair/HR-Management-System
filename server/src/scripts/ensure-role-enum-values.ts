import { prisma } from '../lib/prisma.js';

const run = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ROLE_HEAD_HR';
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ROLE_CAMPUS_HR';
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "User"
    SET "role" = CASE
      WHEN "role"::text = 'ROLE_HEAD_ADMIN' THEN 'ROLE_HEAD_HR'::"Role"
      WHEN "role"::text = 'ROLE_SCHOOL_ADMIN' THEN 'ROLE_CAMPUS_HR'::"Role"
      WHEN "role"::text = 'ROLE_DEPARTMENT_ADMIN' THEN 'ROLE_CAMPUS_HR'::"Role"
      ELSE "role"
    END
    WHERE "role"::text IN ('ROLE_HEAD_ADMIN', 'ROLE_SCHOOL_ADMIN', 'ROLE_DEPARTMENT_ADMIN');
  `);

  console.log('Role enum includes ROLE_HEAD_HR and ROLE_CAMPUS_HR; legacy role rows migrated.');
};

run()
  .catch((error) => {
    console.error('Failed to ensure role enum values:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
