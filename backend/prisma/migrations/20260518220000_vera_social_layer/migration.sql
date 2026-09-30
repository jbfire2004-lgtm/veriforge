-- Feed comment threading
ALTER TABLE "FeedInteraction" ADD COLUMN "parentId" TEXT;
ALTER TABLE "FeedInteraction" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "FeedInteraction"
  ADD CONSTRAINT "FeedInteraction_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "FeedInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FeedInteraction_parentId_idx" ON "FeedInteraction"("parentId");

-- Feed subscription: follow users
ALTER TYPE "FeedSubscriptionTargetType" ADD VALUE 'USER';

-- Social activity verbs
CREATE TYPE "SocialActivityVerb" AS ENUM ('LIKE', 'UNLIKE', 'COMMENT', 'SHARE', 'FOLLOW', 'UNFOLLOW', 'SUBSCRIBE');

CREATE TYPE "SocialActivityTargetType" AS ENUM ('FEED_ITEM', 'USER', 'FEED_SOURCE', 'COMPANY', 'PROJECT', 'TRADE', 'EXPERT');

CREATE TABLE "SocialUserFollow" (
    "id" TEXT NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialUserFollow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialUserFollow_followerId_followingId_key" ON "SocialUserFollow"("followerId", "followingId");
CREATE INDEX "SocialUserFollow_followingId_idx" ON "SocialUserFollow"("followingId");

ALTER TABLE "SocialUserFollow" ADD CONSTRAINT "SocialUserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialUserFollow" ADD CONSTRAINT "SocialUserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SocialActivityLog" (
    "id" TEXT NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "verb" "SocialActivityVerb" NOT NULL,
    "targetType" "SocialActivityTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "summary" TEXT,
    "feedItemId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialActivityLog_actorUserId_createdAt_idx" ON "SocialActivityLog"("actorUserId", "createdAt" DESC);
CREATE INDEX "SocialActivityLog_targetType_targetId_idx" ON "SocialActivityLog"("targetType", "targetId");
CREATE INDEX "SocialActivityLog_feedItemId_idx" ON "SocialActivityLog"("feedItemId");

ALTER TABLE "SocialActivityLog" ADD CONSTRAINT "SocialActivityLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
