-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('FEED_ITEM', 'USER', 'EXPERT_QA_QUESTION', 'EXPERT_QA_ANSWER', 'SAFETY_ARTICLE', 'SAFETY_COMMENT', 'JOB_POST');

CREATE TYPE "ModerationReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'MISINFORMATION', 'OFF_TOPIC', 'IMPERSONATION', 'SAFETY_RISK', 'OTHER');

CREATE TYPE "ModerationCaseStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

CREATE TYPE "ModerationCaseSource" AS ENUM ('USER_REPORT', 'AUTO_RULE');

CREATE TYPE "ModerationResolution" AS ENUM ('NO_ACTION', 'CONTENT_HIDDEN', 'USER_WARNED', 'USER_SUSPENDED', 'EXPERT_VERIFIED', 'EXPERT_REJECTED');

CREATE TYPE "ModerationAutoRuleType" AS ENUM ('KEYWORD_MATCH', 'REPORT_THRESHOLD', 'REPUTATION_FLOOR');

CREATE TYPE "ModerationAutoAction" AS ENUM ('FLAG', 'AUTO_HIDE');

CREATE TYPE "ExpertVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ModerationAutoRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "targetType" "ModerationTargetType",
    "ruleType" "ModerationAutoRuleType" NOT NULL,
    "config" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "action" "ModerationAutoAction" NOT NULL DEFAULT 'FLAG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationAutoRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationCase" (
    "id" TEXT NOT NULL,
    "source" "ModerationCaseSource" NOT NULL,
    "targetType" "ModerationTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reportReason" "ModerationReportReason",
    "reportDetails" TEXT,
    "reporterUserId" INTEGER,
    "autoRuleId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "ModerationCaseStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" "ModerationResolution",
    "resolutionNote" TEXT,
    "assignedToUserId" INTEGER,
    "reviewedByUserId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertVerificationRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "status" "ExpertVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "statement" TEXT,
    "tradeEvidence" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" INTEGER,
    "reviewNote" TEXT,

    CONSTRAINT "ExpertVerificationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ModerationAutoRule_enabled_priority_idx" ON "ModerationAutoRule"("enabled", "priority" DESC);

CREATE INDEX "ModerationCase_status_priority_createdAt_idx" ON "ModerationCase"("status", "priority" DESC, "createdAt" DESC);
CREATE INDEX "ModerationCase_targetType_targetId_idx" ON "ModerationCase"("targetType", "targetId");
CREATE INDEX "ModerationCase_reporterUserId_idx" ON "ModerationCase"("reporterUserId");

CREATE INDEX "ExpertVerificationRequest_status_submittedAt_idx" ON "ExpertVerificationRequest"("status", "submittedAt" DESC);
CREATE INDEX "ExpertVerificationRequest_userId_idx" ON "ExpertVerificationRequest"("userId");

ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_autoRuleId_fkey" FOREIGN KEY ("autoRuleId") REFERENCES "ModerationAutoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExpertVerificationRequest" ADD CONSTRAINT "ExpertVerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertVerificationRequest" ADD CONSTRAINT "ExpertVerificationRequest_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertVerificationRequest" ADD CONSTRAINT "ExpertVerificationRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default auto-flag rules
INSERT INTO "ModerationAutoRule" ("id", "name", "enabled", "targetType", "ruleType", "config", "priority", "action", "updatedAt")
VALUES
  ('rule-keyword-spam', 'Spam keyword filter', true, NULL, 'KEYWORD_MATCH', '{"keywords":["casino","crypto airdrop","buy followers"]}', 10, 'FLAG', CURRENT_TIMESTAMP),
  ('rule-report-threshold', 'Multiple reports threshold', true, NULL, 'REPORT_THRESHOLD', '{"threshold":3,"windowHours":72}', 20, 'AUTO_HIDE', CURRENT_TIMESTAMP);
