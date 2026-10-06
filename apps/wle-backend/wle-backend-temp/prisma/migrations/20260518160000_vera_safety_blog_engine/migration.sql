-- Vera Safety Blog Engine

CREATE TYPE "SafetyRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "SafetyBlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "SafetyBlogAuthorType" AS ENUM ('EXPERT', 'COMPANY');
CREATE TYPE "SafetyBlogCommentStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'PENDING');

CREATE TABLE "SafetyBlogCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SafetyBlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SafetyBlogTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafetyBlogTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SafetyBlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "SafetyBlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

CREATE TABLE "SafetyBlogRelatedPost" (
    "fromPostId" TEXT NOT NULL,
    "toPostId" TEXT NOT NULL,
    CONSTRAINT "SafetyBlogRelatedPost_pkey" PRIMARY KEY ("fromPostId","toPostId")
);

ALTER TABLE "SafetyArticle" ADD COLUMN "body" TEXT;
ALTER TABLE "SafetyArticle" ADD COLUMN "metaDescription" VARCHAR(320);
ALTER TABLE "SafetyArticle" ADD COLUMN "canonicalUrl" TEXT;
ALTER TABLE "SafetyArticle" ADD COLUMN "authorType" "SafetyBlogAuthorType" NOT NULL DEFAULT 'EXPERT';
ALTER TABLE "SafetyArticle" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "SafetyArticle" ADD COLUMN "safetyLevel" "SafetyRiskLevel" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "SafetyArticle" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SafetyArticle" ADD COLUMN "status" "SafetyBlogPostStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "SafetyArticle" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SafetyArticle" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "SafetyBlogComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" INTEGER,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "status" "SafetyBlogCommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SafetyBlogComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SafetyBlogCommentVote" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" INTEGER,
    "voterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SafetyBlogCommentVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SafetyBlogCategory_slug_key" ON "SafetyBlogCategory"("slug");
CREATE INDEX "SafetyBlogCategory_sortOrder_idx" ON "SafetyBlogCategory"("sortOrder");
CREATE UNIQUE INDEX "SafetyBlogTag_slug_key" ON "SafetyBlogTag"("slug");
CREATE INDEX "SafetyBlogPostTag_tagId_idx" ON "SafetyBlogPostTag"("tagId");
CREATE INDEX "SafetyArticle_status_publishedAt_idx" ON "SafetyArticle"("status", "publishedAt" DESC);
CREATE INDEX "SafetyArticle_featured_publishedAt_idx" ON "SafetyArticle"("featured", "publishedAt" DESC);
CREATE INDEX "SafetyArticle_categoryId_publishedAt_idx" ON "SafetyArticle"("categoryId", "publishedAt" DESC);
CREATE INDEX "SafetyArticle_safetyLevel_idx" ON "SafetyArticle"("safetyLevel");
CREATE INDEX "SafetyBlogComment_postId_status_createdAt_idx" ON "SafetyBlogComment"("postId", "status", "createdAt");
CREATE INDEX "SafetyBlogComment_parentId_idx" ON "SafetyBlogComment"("parentId");
CREATE UNIQUE INDEX "SafetyBlogCommentVote_commentId_voterKey_key" ON "SafetyBlogCommentVote"("commentId", "voterKey");
CREATE INDEX "SafetyBlogCommentVote_commentId_idx" ON "SafetyBlogCommentVote"("commentId");

ALTER TABLE "SafetyBlogPostTag" ADD CONSTRAINT "SafetyBlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogPostTag" ADD CONSTRAINT "SafetyBlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "SafetyBlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogRelatedPost" ADD CONSTRAINT "SafetyBlogRelatedPost_fromPostId_fkey" FOREIGN KEY ("fromPostId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogRelatedPost" ADD CONSTRAINT "SafetyBlogRelatedPost_toPostId_fkey" FOREIGN KEY ("toPostId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyArticle" ADD CONSTRAINT "SafetyArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SafetyBlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogComment" ADD CONSTRAINT "SafetyBlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogComment" ADD CONSTRAINT "SafetyBlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SafetyBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogComment" ADD CONSTRAINT "SafetyBlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogCommentVote" ADD CONSTRAINT "SafetyBlogCommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "SafetyBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyBlogCommentVote" ADD CONSTRAINT "SafetyBlogCommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
