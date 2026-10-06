-- Vera Expert Q&A System

CREATE TYPE "ExpertQaQuestionStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED', 'HIDDEN');
CREATE TYPE "ExpertQaModerationStatus" AS ENUM ('VISIBLE', 'PENDING', 'HIDDEN');
CREATE TYPE "ExpertBadgeLevel" AS ENUM ('CONTRIBUTOR', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE "ExpertQaAttachmentType" AS ENUM ('IMAGE', 'PDF', 'OTHER');

CREATE TABLE "ExpertProfile" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "trade" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "badgeLevel" "ExpertBadgeLevel" NOT NULL DEFAULT 'CONTRIBUTOR',
    "answerCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertQaTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpertQaTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertQaQuestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "trade" TEXT,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "authorUserId" INTEGER,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "ExpertQaQuestionStatus" NOT NULL DEFAULT 'OPEN',
    "moderationStatus" "ExpertQaModerationStatus" NOT NULL DEFAULT 'PENDING',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "voteScore" INTEGER NOT NULL DEFAULT 0,
    "acceptedAnswerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExpertQaQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertQaQuestionTag" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ExpertQaQuestionTag_pkey" PRIMARY KEY ("questionId","tagId")
);

CREATE TABLE "ExpertQaAttachment" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "ExpertQaAttachmentType" NOT NULL DEFAULT 'OTHER',
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpertQaAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertQaAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "expertProfileId" TEXT,
    "body" TEXT NOT NULL,
    "voteScore" INTEGER NOT NULL DEFAULT 0,
    "isExpertAnswer" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ExpertQaModerationStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExpertQaAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertQaAnswerVote" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" INTEGER,
    "voterKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpertQaAnswerVote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertEndorsement" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "endorsedByUserId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpertEndorsement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");
CREATE INDEX "ExpertProfile_reputationScore_idx" ON "ExpertProfile"("reputationScore" DESC);
CREATE INDEX "ExpertProfile_badgeLevel_idx" ON "ExpertProfile"("badgeLevel");
CREATE UNIQUE INDEX "ExpertQaTag_slug_key" ON "ExpertQaTag"("slug");
CREATE UNIQUE INDEX "ExpertQaQuestion_slug_key" ON "ExpertQaQuestion"("slug");
CREATE UNIQUE INDEX "ExpertQaQuestion_acceptedAnswerId_key" ON "ExpertQaQuestion"("acceptedAnswerId");
CREATE INDEX "ExpertQaQuestion_status_createdAt_idx" ON "ExpertQaQuestion"("status", "createdAt" DESC);
CREATE INDEX "ExpertQaQuestion_moderationStatus_createdAt_idx" ON "ExpertQaQuestion"("moderationStatus", "createdAt" DESC);
CREATE INDEX "ExpertQaQuestion_companyId_createdAt_idx" ON "ExpertQaQuestion"("companyId", "createdAt" DESC);
CREATE INDEX "ExpertQaQuestion_trade_idx" ON "ExpertQaQuestion"("trade");
CREATE INDEX "ExpertQaQuestion_voteScore_idx" ON "ExpertQaQuestion"("voteScore" DESC);
CREATE INDEX "ExpertQaAttachment_questionId_idx" ON "ExpertQaAttachment"("questionId");
CREATE INDEX "ExpertQaAnswer_questionId_voteScore_idx" ON "ExpertQaAnswer"("questionId", "voteScore" DESC);
CREATE INDEX "ExpertQaAnswer_authorUserId_idx" ON "ExpertQaAnswer"("authorUserId");
CREATE UNIQUE INDEX "ExpertQaAnswerVote_answerId_voterKey_key" ON "ExpertQaAnswerVote"("answerId", "voterKey");
CREATE INDEX "ExpertQaAnswerVote_answerId_idx" ON "ExpertQaAnswerVote"("answerId");
CREATE UNIQUE INDEX "ExpertEndorsement_expertProfileId_endorsedByUserId_skill_key" ON "ExpertEndorsement"("expertProfileId", "endorsedByUserId", "skill");
CREATE INDEX "ExpertEndorsement_expertProfileId_idx" ON "ExpertEndorsement"("expertProfileId");

ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_acceptedAnswerId_fkey" FOREIGN KEY ("acceptedAnswerId") REFERENCES "ExpertQaAnswer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertQaQuestionTag" ADD CONSTRAINT "ExpertQaQuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExpertQaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaQuestionTag" ADD CONSTRAINT "ExpertQaQuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ExpertQaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaAttachment" ADD CONSTRAINT "ExpertQaAttachment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExpertQaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaAnswer" ADD CONSTRAINT "ExpertQaAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExpertQaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaAnswer" ADD CONSTRAINT "ExpertQaAnswer_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaAnswer" ADD CONSTRAINT "ExpertQaAnswer_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertQaAnswerVote" ADD CONSTRAINT "ExpertQaAnswerVote_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "ExpertQaAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertQaAnswerVote" ADD CONSTRAINT "ExpertQaAnswerVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertEndorsement" ADD CONSTRAINT "ExpertEndorsement_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertEndorsement" ADD CONSTRAINT "ExpertEndorsement_endorsedByUserId_fkey" FOREIGN KEY ("endorsedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
