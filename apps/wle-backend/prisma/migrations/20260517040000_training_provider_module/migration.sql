-- Training Provider module
CREATE TYPE "ProviderApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ProviderComplianceLevel" AS ENUM ('COMPLIANT', 'NEEDS_ATTENTION', 'NON_COMPLIANT', 'PENDING_REVIEW');
CREATE TYPE "InstructorQualificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRAINING_PROVIDER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRAINING_INSTRUCTOR';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trainingProviderId" INTEGER;

CREATE TABLE "TrainingProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "qrToken" TEXT,
    "approvalStatus" "ProviderApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProvider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrainingProvider_code_key" ON "TrainingProvider"("code");
CREATE UNIQUE INDEX "TrainingProvider_email_key" ON "TrainingProvider"("email");
CREATE UNIQUE INDEX "TrainingProvider_qrToken_key" ON "TrainingProvider"("qrToken");

CREATE TABLE "TrainingInstructor" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "licenseNumber" TEXT,
    "qualifiedCourseCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualificationExpiresAt" TIMESTAMP(3),
    "qualificationStatus" "InstructorQualificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingInstructor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrainingInstructor_userId_key" ON "TrainingInstructor"("userId");
CREATE INDEX "TrainingInstructor_providerId_active_idx" ON "TrainingInstructor"("providerId", "active");

CREATE TABLE "TrainingCourse" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "certificationId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationHours" DOUBLE PRECISION,
    "validityDays" INTEGER,
    "contentText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCourse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrainingCourse_providerId_code_key" ON "TrainingCourse"("providerId", "code");
CREATE INDEX "TrainingCourse_providerId_active_idx" ON "TrainingCourse"("providerId", "active");

CREATE TABLE "TrainingCourseStandard" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "standardKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minScore" INTEGER,

    CONSTRAINT "TrainingCourseStandard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TrainingCourseStandard_courseId_idx" ON "TrainingCourseStandard"("courseId");

CREATE TABLE "ProviderApproval" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" "ProviderApprovalStatus" NOT NULL,
    "reviewedBy" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderApproval_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProviderApproval_providerId_createdAt_idx" ON "ProviderApproval"("providerId", "createdAt");

CREATE TABLE "ProviderComplianceStatus" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" "ProviderComplianceLevel" NOT NULL,
    "score" INTEGER,
    "gaps" JSONB,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ProviderComplianceStatus_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProviderComplianceStatus_providerId_assessedAt_idx" ON "ProviderComplianceStatus"("providerId", "assessedAt");

CREATE TABLE "_CourseInstructors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

CREATE UNIQUE INDEX "_CourseInstructors_AB_unique" ON "_CourseInstructors"("A", "B");
CREATE INDEX "_CourseInstructors_B_index" ON "_CourseInstructors"("B");

ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "trainingProviderId" INTEGER;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "courseId" INTEGER;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "instructorId" INTEGER;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "certificateUrl" TEXT;
ALTER TABLE "TrainingRecord" ADD COLUMN IF NOT EXISTS "certificateQrToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "TrainingRecord_certificateQrToken_key" ON "TrainingRecord"("certificateQrToken");
CREATE INDEX IF NOT EXISTS "TrainingRecord_trainingProviderId_idx" ON "TrainingRecord"("trainingProviderId");
CREATE INDEX IF NOT EXISTS "TrainingRecord_courseId_idx" ON "TrainingRecord"("courseId");
CREATE INDEX IF NOT EXISTS "TrainingRecord_companyId_idx" ON "TrainingRecord"("companyId");
CREATE INDEX IF NOT EXISTS "TrainingRecord_projectId_idx" ON "TrainingRecord"("projectId");

ALTER TABLE "User" ADD CONSTRAINT "User_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TrainingInstructor" ADD CONSTRAINT "TrainingInstructor_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingInstructor" ADD CONSTRAINT "TrainingInstructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TrainingCourse" ADD CONSTRAINT "TrainingCourse_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingCourse" ADD CONSTRAINT "TrainingCourse_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TrainingCourseStandard" ADD CONSTRAINT "TrainingCourseStandard_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProviderComplianceStatus" ADD CONSTRAINT "ProviderComplianceStatus_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_A_fkey" FOREIGN KEY ("A") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingInstructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "TrainingInstructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
