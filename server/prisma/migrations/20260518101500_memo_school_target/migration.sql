-- Add teaching school target support for memos
ALTER TABLE "Memo"
  ADD COLUMN "schoolId" TEXT;

DROP INDEX IF EXISTS "Memo_title_campusId_departmentId_recipientEmployeeId_key";
DROP INDEX IF EXISTS "Memo_title_campusId_schoolId_departmentId_recipientEmployeeId_key";

CREATE INDEX "Memo_schoolId_idx" ON "Memo"("schoolId");

CREATE UNIQUE INDEX "Memo_title_campusId_schoolId_departmentId_recipientEmployeeId_key"
  ON "Memo"("title", "campusId", "schoolId", "departmentId", "recipientEmployeeId");

ALTER TABLE "Memo"
  ADD CONSTRAINT "Memo_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId")
  ON DELETE SET NULL ON UPDATE CASCADE;
