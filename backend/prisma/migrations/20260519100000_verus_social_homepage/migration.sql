-- CreateEnum
CREATE TYPE "SocialPostType" AS ENUM ('PROVIDER_POST', 'COMPANY_ANNOUNCEMENT', 'SAFETY_BULLETIN', 'JOB_POSTING', 'WORKER_MILESTONE', 'TRAINING_UPLOAD', 'SYSTEM_UPDATE');
CREATE TYPE "SocialPostVisibility" AS ENUM ('PUBLIC', 'COMPANY', 'FOLLOWERS');
CREATE TYPE "SocialFollowTargetType" AS ENUM ('COMPANY', 'PROVIDER', 'USER');

-- AlterEnum
ALTER TYPE "FeedSource" ADD VALUE IF NOT EXISTS 'SOCIAL_POST';

-- CreateTable posts
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "postType" "SocialPostType" NOT NULL DEFAULT 'PROVIDER_POST',
    "title" TEXT,
    "body" TEXT NOT NULL,
    "companyId" INTEGER,
    "trainingProviderId" INTEGER,
    "workerId" INTEGER,
    "visibility" "SocialPostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pinned_posts" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "pinnedByUserId" INTEGER NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "scopeKey" TEXT,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pinned_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "follow_relationships" (
    "id" TEXT NOT NULL,
    "followerUserId" INTEGER NOT NULL,
    "targetType" "SocialFollowTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_relationships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "trainingProviderId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "websiteUrl" TEXT,
    "links" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sponsored_ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaUrl" TEXT,
    "ctaLabel" TEXT,
    "targetingRules" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sponsored_ads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_attachments" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "uploaderUserId" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "moderation_flags" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterUserId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moderation_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trending_metrics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "likeVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commentVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shareVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trending_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saved_posts" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_posts_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "post_likes_postId_userId_key" ON "post_likes"("postId", "userId");
CREATE INDEX "post_likes_postId_idx" ON "post_likes"("postId");
CREATE INDEX "post_comments_postId_createdAt_idx" ON "post_comments"("postId", "createdAt");
CREATE INDEX "post_comments_parentId_idx" ON "post_comments"("parentId");
CREATE UNIQUE INDEX "pinned_posts_postId_key" ON "pinned_posts"("postId");
CREATE INDEX "pinned_posts_scope_scopeKey_idx" ON "pinned_posts"("scope", "scopeKey");
CREATE UNIQUE INDEX "follow_relationships_followerUserId_targetType_targetId_key" ON "follow_relationships"("followerUserId", "targetType", "targetId");
CREATE INDEX "follow_relationships_targetType_targetId_idx" ON "follow_relationships"("targetType", "targetId");
CREATE UNIQUE INDEX "provider_profiles_trainingProviderId_key" ON "provider_profiles"("trainingProviderId");
CREATE INDEX "sponsored_ads_active_startsAt_idx" ON "sponsored_ads"("active", "startsAt");
CREATE INDEX "media_attachments_postId_idx" ON "media_attachments"("postId");
CREATE INDEX "moderation_flags_postId_status_idx" ON "moderation_flags"("postId", "status");
CREATE UNIQUE INDEX "trending_metrics_postId_key" ON "trending_metrics"("postId");
CREATE INDEX "trending_metrics_score_idx" ON "trending_metrics"("score" DESC);
CREATE UNIQUE INDEX "saved_posts_postId_userId_key" ON "saved_posts"("postId", "userId");
CREATE INDEX "posts_publishedAt_idx" ON "posts"("publishedAt" DESC);
CREATE INDEX "posts_authorUserId_publishedAt_idx" ON "posts"("authorUserId", "publishedAt" DESC);
CREATE INDEX "posts_companyId_publishedAt_idx" ON "posts"("companyId", "publishedAt" DESC);
CREATE INDEX "posts_trainingProviderId_publishedAt_idx" ON "posts"("trainingProviderId", "publishedAt" DESC);
CREATE INDEX "posts_postType_publishedAt_idx" ON "posts"("postType", "publishedAt" DESC);

-- ForeignKeys
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pinned_posts" ADD CONSTRAINT "pinned_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pinned_posts" ADD CONSTRAINT "pinned_posts_pinnedByUserId_fkey" FOREIGN KEY ("pinnedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_relationships" ADD CONSTRAINT "follow_relationships_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trending_metrics" ADD CONSTRAINT "trending_metrics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
