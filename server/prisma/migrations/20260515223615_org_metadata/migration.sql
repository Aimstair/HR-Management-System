-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('TEACHING', 'NON_TEACHING');

-- AlterTable
ALTER TABLE "Campus" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "type" "SchoolType" NOT NULL DEFAULT 'TEACHING';

-- CreateIndex
CREATE INDEX "School_type_idx" ON "School"("type");
