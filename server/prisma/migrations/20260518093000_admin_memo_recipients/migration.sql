-- Add memo metadata and recipient support
ALTER TABLE "Memo"
  ADD COLUMN "memoType" TEXT NOT NULL DEFAULT 'Internal Memo',
  ADD COLUMN "attachments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "recipientEmployeeId" TEXT,
  ALTER COLUMN "campusId" DROP NOT NULL;

DROP INDEX IF EXISTS "Memo_title_campusId_departmentId_key";

CREATE UNIQUE INDEX "Memo_title_campusId_departmentId_recipientEmployeeId_key"
  ON "Memo"("title", "campusId", "departmentId", "recipientEmployeeId");

CREATE INDEX "Memo_recipientEmployeeId_idx" ON "Memo"("recipientEmployeeId");

ALTER TABLE "Memo"
  ADD CONSTRAINT "Memo_recipientEmployeeId_fkey"
  FOREIGN KEY ("recipientEmployeeId") REFERENCES "User"("userId")
  ON DELETE SET NULL ON UPDATE CASCADE;
