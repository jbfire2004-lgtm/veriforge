-- Vera Feed Engine: interactions, subscriptions, extended FeedItem

-- AlterEnum
ALTER TYPE "FeedSource" ADD VALUE 'TRAINING_EXPIRY';
ALTER TYPE "FeedSource" ADD VALUE 'UNION_DISPATCH';

-- CreateEnum
CREATE TYPE "FeedInteractionType" AS ENUM ('LIKE', 'COMMENT', 'SHARE');
CREATE TYPE "FeedSubscriptionTargetType" AS ENUM ('SOURCE', 'COMPANY', 'PROJECT', 'TRADE', 'EXPERT');

-- AlterTable FeedItem
ALTER TABLE "FeedItem" ADD COLUMN "projectId" INTEGER;
ALTER TABLE "FeedItem" ADD COLUMN "trade" TEXT;
ALTER TABLE "FeedItem" ADD COLUMN "safetyPriority" INTEGER NOT NULL DEFAULT 0;

-- CreateTable FeedInteraction
CREATE TABLE "FeedInteraction" (
    "id" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "FeedInteractionType" NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable FeedSubscription
CREATE TABLE "FeedSubscription" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetType" "FeedSubscriptionTargetType" NOT NULL,
    "targetKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedItem_projectId_publishedAt_idx" ON "FeedItem"("projectId", "publishedAt" DESC);
CREATE INDEX "FeedInteraction_feedItemId_type_idx" ON "FeedInteraction"("feedItemId", "type");
CREATE INDEX "FeedInteraction_userId_createdAt_idx" ON "FeedInteraction"("userId", "createdAt" DESC);
CREATE UNIQUE INDEX "FeedSubscription_userId_targetType_targetKey_key" ON "FeedSubscription"("userId", "targetType", "targetKey");
CREATE INDEX "FeedSubscription_userId_idx" ON "FeedSubscription"("userId");

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FeedInteraction" ADD CONSTRAINT "FeedInteraction_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedInteraction" ADD CONSTRAINT "FeedInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedSubscription" ADD CONSTRAINT "FeedSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
