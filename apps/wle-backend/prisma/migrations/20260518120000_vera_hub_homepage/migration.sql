-- CreateEnum
CREATE TYPE "FeedSource" AS ENUM ('VERA_CORE_TRAINING', 'VERA_CORE_PROJECT', 'VERA_CORE_EQUIPMENT', 'JOB_BOARD', 'SAFETY_BLOG', 'COMPANY_ANNOUNCEMENT', 'WORKER_ACHIEVEMENT', 'EXPERT_ANSWER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "WeatherAlertSeverity" AS ENUM ('INFO', 'WATCH', 'WARNING', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "HubHomepageRole" AS ENUM ('WORKER', 'SUPERVISOR', 'COMPANY_ADMIN', 'UNION_HALL');

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "source" "FeedSource" NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,
    "unionHallId" INTEGER,
    "workerId" INTEGER,
    "metadata" JSONB,
    "rankScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rankScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherAlert" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "WeatherAlertSeverity" NOT NULL DEFAULT 'INFO',
    "hazardType" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'vera-hub',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHomepagePreferences" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "pinnedSections" JSONB NOT NULL DEFAULT '[]',
    "hiddenFeedSources" "FeedSource"[] DEFAULT ARRAY[]::"FeedSource"[],
    "region" TEXT,
    "showWeatherAlerts" BOOLEAN NOT NULL DEFAULT true,
    "feedPageSize" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHomepagePreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT,
    "trade" TEXT,
    "payRange" TEXT,
    "summary" TEXT,
    "url" TEXT,
    "companyId" INTEGER,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "authorName" TEXT,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "readMinutes" INTEGER NOT NULL DEFAULT 5,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_source_externalId_key" ON "FeedItem"("source", "externalId");

-- CreateIndex
CREATE INDEX "FeedItem_publishedAt_idx" ON "FeedItem"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_companyId_publishedAt_idx" ON "FeedItem"("companyId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_unionHallId_publishedAt_idx" ON "FeedItem"("unionHallId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_source_publishedAt_idx" ON "FeedItem"("source", "publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TrendingTopic_slug_key" ON "TrendingTopic"("slug");

-- CreateIndex
CREATE INDEX "TrendingTopic_active_rankScore_idx" ON "TrendingTopic"("active", "rankScore" DESC);

-- CreateIndex
CREATE INDEX "WeatherAlert_region_startsAt_idx" ON "WeatherAlert"("region", "startsAt" DESC);

-- CreateIndex
CREATE INDEX "WeatherAlert_companyId_severity_idx" ON "WeatherAlert"("companyId", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "UserHomepagePreferences_userId_key" ON "UserHomepagePreferences"("userId");

-- CreateIndex
CREATE INDEX "JobPost_active_publishedAt_idx" ON "JobPost"("active", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "JobPost_companyId_active_idx" ON "JobPost"("companyId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyArticle_slug_key" ON "SafetyArticle"("slug");

-- CreateIndex
CREATE INDEX "SafetyArticle_active_publishedAt_idx" ON "SafetyArticle"("active", "publishedAt" DESC);

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingTopic" ADD CONSTRAINT "TrendingTopic_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherAlert" ADD CONSTRAINT "WeatherAlert_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomepagePreferences" ADD CONSTRAINT "UserHomepagePreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyArticle" ADD CONSTRAINT "SafetyArticle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
