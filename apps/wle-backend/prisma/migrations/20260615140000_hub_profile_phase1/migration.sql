-- CreateEnum
CREATE TYPE "HubProfileVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS', 'COMPANY');

-- CreateEnum
CREATE TYPE "HubConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateTable
CREATE TABLE "hub_worker_profiles" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "jobBoardProfileId" TEXT,
    "headline" VARCHAR(120),
    "about" TEXT,
    "photoUrl" TEXT,
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "primaryTrade" TEXT,
    "visibility" "HubProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_company_pages" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "tagline" VARCHAR(160),
    "about" TEXT,
    "industry" TEXT,
    "specialties" JSONB NOT NULL DEFAULT '[]',
    "websiteUrl" TEXT,
    "isProviderChannel" BOOLEAN NOT NULL DEFAULT false,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_company_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_connections" (
    "id" TEXT NOT NULL,
    "requesterUserId" INTEGER NOT NULL,
    "addresseeUserId" INTEGER NOT NULL,
    "status" "HubConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "hub_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hub_worker_profiles_userId_key" ON "hub_worker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_worker_profiles_workerId_key" ON "hub_worker_profiles"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_worker_profiles_jobBoardProfileId_key" ON "hub_worker_profiles"("jobBoardProfileId");

-- CreateIndex
CREATE INDEX "hub_worker_profiles_primaryTrade_locationRegion_idx" ON "hub_worker_profiles"("primaryTrade", "locationRegion");

-- CreateIndex
CREATE INDEX "hub_worker_profiles_workerId_idx" ON "hub_worker_profiles"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_company_pages_companyId_key" ON "hub_company_pages"("companyId");

-- CreateIndex
CREATE INDEX "hub_connections_addresseeUserId_status_idx" ON "hub_connections"("addresseeUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "hub_connections_requesterUserId_addresseeUserId_key" ON "hub_connections"("requesterUserId", "addresseeUserId");

-- AddForeignKey
ALTER TABLE "hub_worker_profiles" ADD CONSTRAINT "hub_worker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_worker_profiles" ADD CONSTRAINT "hub_worker_profiles_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_worker_profiles" ADD CONSTRAINT "hub_worker_profiles_jobBoardProfileId_fkey" FOREIGN KEY ("jobBoardProfileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_company_pages" ADD CONSTRAINT "hub_company_pages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_connections" ADD CONSTRAINT "hub_connections_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_connections" ADD CONSTRAINT "hub_connections_addresseeUserId_fkey" FOREIGN KEY ("addresseeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
