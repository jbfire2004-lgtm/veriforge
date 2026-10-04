-- Vera Job Board marketplace

CREATE TYPE "JobBoardExperienceLevel" AS ENUM ('ENTRY', 'INTERMEDIATE', 'JOURNEYMAN', 'FOREMAN');
CREATE TYPE "JobBoardApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN');

ALTER TABLE "JobPost" ADD COLUMN "slug" TEXT;
UPDATE "JobPost" SET "slug" = CONCAT('job-', "id") WHERE "slug" IS NULL;
ALTER TABLE "JobPost" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "JobPost_slug_key" ON "JobPost"("slug");

ALTER TABLE "JobPost" ADD COLUMN "description" TEXT;
ALTER TABLE "JobPost" ADD COLUMN "locationCity" TEXT;
ALTER TABLE "JobPost" ADD COLUMN "locationRegion" TEXT;
ALTER TABLE "JobPost" ADD COLUMN "payMin" DOUBLE PRECISION;
ALTER TABLE "JobPost" ADD COLUMN "payMax" DOUBLE PRECISION;
ALTER TABLE "JobPost" ADD COLUMN "payPeriod" TEXT DEFAULT 'hourly';
ALTER TABLE "JobPost" ADD COLUMN "experienceLevel" "JobBoardExperienceLevel";
ALTER TABLE "JobPost" ADD COLUMN "projectId" INTEGER;
ALTER TABLE "JobPost" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "JobBoardJobTicket" (
    "jobId" TEXT NOT NULL,
    "ticketName" TEXT NOT NULL,
    CONSTRAINT "JobBoardJobTicket_pkey" PRIMARY KEY ("jobId","ticketName")
);

CREATE TABLE "JobBoardWorkerProfile" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "primaryTrade" TEXT,
    "experienceLevel" "JobBoardExperienceLevel",
    "yearsExperience" INTEGER,
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "openToWork" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobBoardWorkerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobBoardWorkerSkill" (
    "profileId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT DEFAULT 'proficient',
    CONSTRAINT "JobBoardWorkerSkill_pkey" PRIMARY KEY ("profileId","skill")
);

CREATE TABLE "JobBoardPortfolioPhoto" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobBoardPortfolioPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobBoardWorkHistory" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "trade" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    CONSTRAINT "JobBoardWorkHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobBoardWorkerEndorsement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "endorserUserId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobBoardWorkerEndorsement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobBoardApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "applicantUserId" INTEGER,
    "coverMessage" TEXT,
    "status" "JobBoardApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "chatRoomId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobBoardApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobBoardWorkerProfile_workerId_key" ON "JobBoardWorkerProfile"("workerId");
CREATE INDEX "JobBoardWorkerProfile_primaryTrade_openToWork_idx" ON "JobBoardWorkerProfile"("primaryTrade", "openToWork");
CREATE INDEX "JobBoardWorkerProfile_locationRegion_idx" ON "JobBoardWorkerProfile"("locationRegion");
CREATE INDEX "JobBoardPortfolioPhoto_profileId_sortOrder_idx" ON "JobBoardPortfolioPhoto"("profileId", "sortOrder");
CREATE INDEX "JobBoardWorkHistory_profileId_idx" ON "JobBoardWorkHistory"("profileId");
CREATE UNIQUE INDEX "JobBoardWorkerEndorsement_profileId_endorserUserId_skill_key" ON "JobBoardWorkerEndorsement"("profileId", "endorserUserId", "skill");
CREATE INDEX "JobBoardWorkerEndorsement_profileId_idx" ON "JobBoardWorkerEndorsement"("profileId");
CREATE UNIQUE INDEX "JobBoardApplication_jobId_workerId_key" ON "JobBoardApplication"("jobId", "workerId");
CREATE UNIQUE INDEX "JobBoardApplication_chatRoomId_key" ON "JobBoardApplication"("chatRoomId");
CREATE INDEX "JobBoardApplication_jobId_status_idx" ON "JobBoardApplication"("jobId", "status");
CREATE INDEX "JobBoardApplication_workerId_status_idx" ON "JobBoardApplication"("workerId", "status");
CREATE INDEX "JobPost_trade_active_idx" ON "JobPost"("trade", "active");
CREATE INDEX "JobPost_locationRegion_active_idx" ON "JobPost"("locationRegion", "active");
CREATE INDEX "JobPost_payMin_payMax_idx" ON "JobPost"("payMin", "payMax");
CREATE INDEX "JobPost_experienceLevel_idx" ON "JobPost"("experienceLevel");

ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobBoardJobTicket" ADD CONSTRAINT "JobBoardJobTicket_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardWorkerProfile" ADD CONSTRAINT "JobBoardWorkerProfile_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardWorkerSkill" ADD CONSTRAINT "JobBoardWorkerSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardPortfolioPhoto" ADD CONSTRAINT "JobBoardPortfolioPhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardWorkHistory" ADD CONSTRAINT "JobBoardWorkHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardWorkerEndorsement" ADD CONSTRAINT "JobBoardWorkerEndorsement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardWorkerEndorsement" ADD CONSTRAINT "JobBoardWorkerEndorsement_endorserUserId_fkey" FOREIGN KEY ("endorserUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
