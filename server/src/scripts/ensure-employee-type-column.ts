import { prisma } from '../lib/prisma.js';

const run = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmployeeType') THEN
        CREATE TYPE "EmployeeType" AS ENUM ('TEACHING', 'NON_TEACHING');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "employeeType" "EmployeeType" NOT NULL DEFAULT 'NON_TEACHING';
  `);

  const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'employeeType'
    LIMIT 1
  `;

  if (result.length === 0) {
    throw new Error('employeeType column verification failed');
  }

  console.log('employeeType column exists on public."User"');
};

run()
  .catch((error) => {
    console.error('Failed to ensure employeeType column:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
