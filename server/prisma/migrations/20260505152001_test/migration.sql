-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ROLE_HEAD_HR', 'ROLE_CAMPUS_HR', 'ROLE_EMPLOYEE');

-- CreateEnum
CREATE TYPE "AdminScopeType" AS ENUM ('GLOBAL', 'SCHOOL', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('TEACHING', 'NON_TEACHING');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('LEAVE', 'EXPENSE', 'FUND', 'OVERTIME', 'UNDERTIME', 'WFH', 'TIME_ADJUSTMENT', 'SHIFT_ASSIGNMENT', 'SWAP_REQUEST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TeachingAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "NonTeachingAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE');

-- CreateEnum
CREATE TYPE "PerformanceRubricType" AS ENUM ('TEACHING', 'NON_TEACHING');

-- CreateTable
CREATE TABLE "Campus" (
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("campusId")
);

-- CreateTable
CREATE TABLE "School" (
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("schoolId")
);

-- CreateTable
CREATE TABLE "Department" (
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("departmentId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "employeeType" "EmployeeType" NOT NULL DEFAULT 'NON_TEACHING',
    "department" TEXT,
    "schoolBranch" TEXT,
    "position" TEXT,
    "profileImage" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolId" TEXT,
    "departmentId" TEXT,
    "adminScopeType" "AdminScopeType",
    "adminSchoolId" TEXT,
    "adminSchoolName" TEXT,
    "adminDepartmentId" TEXT,
    "adminDepartmentName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "RequestRecord" (
    "requestId" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "leaveStartDate" TIMESTAMP(3),
    "leaveEndDate" TIMESTAMP(3),
    "employeeId" TEXT NOT NULL,
    "reviewedById" TEXT,
    "campusId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestRecord_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "Shift" (
    "shiftId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("shiftId")
);

-- CreateTable
CREATE TABLE "Memo" (
    "memoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "scopeType" "AdminScopeType",
    "campusId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("memoId")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "refreshTokenId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("refreshTokenId")
);

-- CreateTable
CREATE TABLE "Subject" (
    "subjectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subjectId")
);

-- CreateTable
CREATE TABLE "TeachingAssignment" (
    "assignmentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "departmentId" TEXT,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingAssignment_pkey" PRIMARY KEY ("assignmentId")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "classSessionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "departmentId" TEXT,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "room" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("classSessionId")
);

-- CreateTable
CREATE TABLE "TeachingAttendance" (
    "attendanceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "status" "TeachingAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "minutesLate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingAttendance_pkey" PRIMARY KEY ("attendanceId")
);

-- CreateTable
CREATE TABLE "NonTeachingAttendance" (
    "attendanceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "departmentId" TEXT,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "status" "NonTeachingAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "remarks" TEXT,
    "minutesLate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NonTeachingAttendance_pkey" PRIMARY KEY ("attendanceId")
);

-- CreateTable
CREATE TABLE "PerformanceEvaluation" (
    "evaluationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "departmentId" TEXT,
    "evaluatorId" TEXT,
    "rubricType" "PerformanceRubricType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "criteria" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceEvaluation_pkey" PRIMARY KEY ("evaluationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campus_name_key" ON "Campus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_code_key" ON "Campus"("code");

-- CreateIndex
CREATE INDEX "School_campusId_idx" ON "School"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "School_campusId_name_key" ON "School"("campusId", "name");

-- CreateIndex
CREATE INDEX "Department_schoolId_idx" ON "Department"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_schoolId_name_key" ON "Department"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_adminScopeType_idx" ON "User"("adminScopeType");

-- CreateIndex
CREATE INDEX "User_schoolId_idx" ON "User"("schoolId");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE INDEX "User_employeeType_idx" ON "User"("employeeType");

-- CreateIndex
CREATE INDEX "User_schoolId_isActive_idx" ON "User"("schoolId", "isActive");

-- CreateIndex
CREATE INDEX "User_departmentId_isActive_idx" ON "User"("departmentId", "isActive");

-- CreateIndex
CREATE INDEX "RequestRecord_employeeId_idx" ON "RequestRecord"("employeeId");

-- CreateIndex
CREATE INDEX "RequestRecord_reviewedById_idx" ON "RequestRecord"("reviewedById");

-- CreateIndex
CREATE INDEX "RequestRecord_campusId_idx" ON "RequestRecord"("campusId");

-- CreateIndex
CREATE INDEX "RequestRecord_departmentId_idx" ON "RequestRecord"("departmentId");

-- CreateIndex
CREATE INDEX "RequestRecord_status_idx" ON "RequestRecord"("status");

-- CreateIndex
CREATE INDEX "RequestRecord_campusId_status_idx" ON "RequestRecord"("campusId", "status");

-- CreateIndex
CREATE INDEX "RequestRecord_departmentId_status_idx" ON "RequestRecord"("departmentId", "status");

-- CreateIndex
CREATE INDEX "RequestRecord_leaveStartDate_leaveEndDate_idx" ON "RequestRecord"("leaveStartDate", "leaveEndDate");

-- CreateIndex
CREATE UNIQUE INDEX "RequestRecord_type_employeeId_title_key" ON "RequestRecord"("type", "employeeId", "title");

-- CreateIndex
CREATE INDEX "Shift_campusId_idx" ON "Shift"("campusId");

-- CreateIndex
CREATE INDEX "Shift_departmentId_idx" ON "Shift"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_name_campusId_departmentId_startTime_endTime_key" ON "Shift"("name", "campusId", "departmentId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Memo_campusId_idx" ON "Memo"("campusId");

-- CreateIndex
CREATE INDEX "Memo_departmentId_idx" ON "Memo"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Memo_title_campusId_departmentId_key" ON "Memo"("title", "campusId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Subject_schoolId_idx" ON "Subject"("schoolId");

-- CreateIndex
CREATE INDEX "Subject_departmentId_idx" ON "Subject"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_schoolId_code_key" ON "Subject"("schoolId", "code");

-- CreateIndex
CREATE INDEX "TeachingAssignment_employeeId_idx" ON "TeachingAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_subjectId_idx" ON "TeachingAssignment"("subjectId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_schoolId_idx" ON "TeachingAssignment"("schoolId");

-- CreateIndex
CREATE INDEX "TeachingAssignment_departmentId_idx" ON "TeachingAssignment"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingAssignment_employeeId_subjectId_startsOn_key" ON "TeachingAssignment"("employeeId", "subjectId", "startsOn");

-- CreateIndex
CREATE INDEX "ClassSession_subjectId_sessionDate_idx" ON "ClassSession"("subjectId", "sessionDate");

-- CreateIndex
CREATE INDEX "ClassSession_schoolId_sessionDate_idx" ON "ClassSession"("schoolId", "sessionDate");

-- CreateIndex
CREATE INDEX "ClassSession_departmentId_sessionDate_idx" ON "ClassSession"("departmentId", "sessionDate");

-- CreateIndex
CREATE INDEX "TeachingAttendance_employeeId_idx" ON "TeachingAttendance"("employeeId");

-- CreateIndex
CREATE INDEX "TeachingAttendance_classSessionId_idx" ON "TeachingAttendance"("classSessionId");

-- CreateIndex
CREATE INDEX "TeachingAttendance_status_idx" ON "TeachingAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingAttendance_employeeId_classSessionId_key" ON "TeachingAttendance"("employeeId", "classSessionId");

-- CreateIndex
CREATE INDEX "NonTeachingAttendance_schoolId_attendanceDate_idx" ON "NonTeachingAttendance"("schoolId", "attendanceDate");

-- CreateIndex
CREATE INDEX "NonTeachingAttendance_departmentId_attendanceDate_idx" ON "NonTeachingAttendance"("departmentId", "attendanceDate");

-- CreateIndex
CREATE INDEX "NonTeachingAttendance_status_idx" ON "NonTeachingAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NonTeachingAttendance_employeeId_attendanceDate_key" ON "NonTeachingAttendance"("employeeId", "attendanceDate");

-- CreateIndex
CREATE INDEX "PerformanceEvaluation_employeeId_idx" ON "PerformanceEvaluation"("employeeId");

-- CreateIndex
CREATE INDEX "PerformanceEvaluation_schoolId_rubricType_idx" ON "PerformanceEvaluation"("schoolId", "rubricType");

-- CreateIndex
CREATE INDEX "PerformanceEvaluation_departmentId_rubricType_idx" ON "PerformanceEvaluation"("departmentId", "rubricType");

-- CreateIndex
CREATE INDEX "PerformanceEvaluation_periodStart_periodEnd_idx" ON "PerformanceEvaluation"("periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campusId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Campus"("campusId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecord" ADD CONSTRAINT "RequestRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecord" ADD CONSTRAINT "RequestRecord_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecord" ADD CONSTRAINT "RequestRecord_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campusId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecord" ADD CONSTRAINT "RequestRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campusId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("campusId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAttendance" ADD CONSTRAINT "TeachingAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAttendance" ADD CONSTRAINT "TeachingAttendance_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("classSessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonTeachingAttendance" ADD CONSTRAINT "NonTeachingAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonTeachingAttendance" ADD CONSTRAINT "NonTeachingAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Campus"("campusId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonTeachingAttendance" ADD CONSTRAINT "NonTeachingAttendance_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Campus"("campusId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvaluation" ADD CONSTRAINT "PerformanceEvaluation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE SET NULL ON UPDATE CASCADE;
