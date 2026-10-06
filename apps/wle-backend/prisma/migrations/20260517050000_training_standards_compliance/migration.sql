-- Training Standards Compliance Engine
CREATE TYPE "TrainingStandardKind" AS ENUM ('CSA', 'PROVINCIAL_OHS', 'FEDERAL_OHS', 'INDUSTRY_COP');
CREATE TYPE "TrainingValidationOutcome" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');
CREATE TYPE "TrainingValidationSubject" AS ENUM ('TRAINING_RECORD', 'PROVIDER', 'INSTRUCTOR', 'CERTIFICATE', 'COURSE');
CREATE TYPE "TrainingRejectionSeverity" AS ENUM ('ERROR', 'WARNING');
CREATE TYPE "TrainingRejectionCategory" AS ENUM ('STANDARD', 'JURISDICTION', 'PROVIDER', 'INSTRUCTOR', 'EXPIRY', 'CERTIFICATE', 'PROGRAM');

CREATE TABLE "TrainingStandard" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "TrainingStandardKind" NOT NULL,
    "jurisdictionCode" TEXT,
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "defaultValidityDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingStandard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TrainingStandard_code_key" ON "TrainingStandard"("code");
CREATE INDEX "TrainingStandard_kind_active_idx" ON "TrainingStandard"("kind", "active");
CREATE INDEX "TrainingStandard_jurisdictionCode_idx" ON "TrainingStandard"("jurisdictionCode");

CREATE TABLE "JurisdictionRequirement" (
    "id" SERIAL NOT NULL,
    "jurisdictionCode" TEXT NOT NULL,
    "regionName" TEXT NOT NULL,
    "standardCode" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "tradeCode" TEXT,
    "certificationId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "JurisdictionRequirement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "JurisdictionRequirement_jurisdictionCode_standardCode_tradeCode_key" ON "JurisdictionRequirement"("jurisdictionCode", "standardCode", "tradeCode");
CREATE INDEX "JurisdictionRequirement_jurisdictionCode_required_idx" ON "JurisdictionRequirement"("jurisdictionCode", "required");

CREATE TABLE "ProviderQualificationRule" (
    "id" SERIAL NOT NULL,
    "trainingProviderId" INTEGER,
    "ruleKey" TEXT NOT NULL,
    "description" TEXT,
    "requiredApprovalStatus" "ProviderApprovalStatus",
    "requiredStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minProviderScore" INTEGER,
    "requiresActiveProvider" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ProviderQualificationRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProviderQualificationRule_trainingProviderId_ruleKey_key" ON "ProviderQualificationRule"("trainingProviderId", "ruleKey");

CREATE TABLE "InstructorQualificationRule" (
    "id" SERIAL NOT NULL,
    "trainingProviderId" INTEGER,
    "ruleKey" TEXT NOT NULL,
    "description" TEXT,
    "courseCodePattern" TEXT,
    "requiresLicense" BOOLEAN NOT NULL DEFAULT false,
    "maxQualificationAgeDays" INTEGER,
    "requiredStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "InstructorQualificationRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InstructorQualificationRule_trainingProviderId_ruleKey_key" ON "InstructorQualificationRule"("trainingProviderId", "ruleKey");

CREATE TABLE "TrainingRejectionReason" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "TrainingRejectionSeverity" NOT NULL DEFAULT 'ERROR',
    "category" "TrainingRejectionCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TrainingRejectionReason_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TrainingRejectionReason_code_key" ON "TrainingRejectionReason"("code");

CREATE TABLE "TrainingValidationResult" (
    "id" SERIAL NOT NULL,
    "subjectType" "TrainingValidationSubject" NOT NULL,
    "outcome" "TrainingValidationOutcome" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "jurisdictionCode" TEXT,
    "matchedStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "details" JSONB,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedBy" INTEGER,
    "trainingRecordId" INTEGER,
    "trainingProviderId" INTEGER,
    "instructorId" INTEGER,
    "courseId" INTEGER,
    "certificateQrToken" TEXT,
    CONSTRAINT "TrainingValidationResult_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TrainingValidationResult_subjectType_outcome_validatedAt_idx" ON "TrainingValidationResult"("subjectType", "outcome", "validatedAt");
CREATE INDEX "TrainingValidationResult_trainingRecordId_validatedAt_idx" ON "TrainingValidationResult"("trainingRecordId", "validatedAt");
CREATE INDEX "TrainingValidationResult_trainingProviderId_validatedAt_idx" ON "TrainingValidationResult"("trainingProviderId", "validatedAt");
CREATE INDEX "TrainingValidationResult_certificateQrToken_idx" ON "TrainingValidationResult"("certificateQrToken");

CREATE TABLE "TrainingValidationRejection" (
    "validationResultId" INTEGER NOT NULL,
    "rejectionReasonId" INTEGER NOT NULL,
    "message" TEXT,
    CONSTRAINT "TrainingValidationRejection_pkey" PRIMARY KEY ("validationResultId","rejectionReasonId")
);

ALTER TABLE "JurisdictionRequirement" ADD CONSTRAINT "JurisdictionRequirement_standardCode_fkey" FOREIGN KEY ("standardCode") REFERENCES "TrainingStandard"("code") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JurisdictionRequirement" ADD CONSTRAINT "JurisdictionRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProviderQualificationRule" ADD CONSTRAINT "ProviderQualificationRule_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstructorQualificationRule" ADD CONSTRAINT "InstructorQualificationRule_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "TrainingInstructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationRejection" ADD CONSTRAINT "TrainingValidationRejection_validationResultId_fkey" FOREIGN KEY ("validationResultId") REFERENCES "TrainingValidationResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingValidationRejection" ADD CONSTRAINT "TrainingValidationRejection_rejectionReasonId_fkey" FOREIGN KEY ("rejectionReasonId") REFERENCES "TrainingRejectionReason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
