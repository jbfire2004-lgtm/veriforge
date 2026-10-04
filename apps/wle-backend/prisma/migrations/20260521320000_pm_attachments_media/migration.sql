-- PM Attachments & Media — extend pm_attachments + annotations + audit

CREATE TYPE "PmAttachmentStatus" AS ENUM ('uploaded', 'processed', 'annotated', 'linked', 'archived');
CREATE TYPE "PmAttachmentVirusScanStatus" AS ENUM ('pending', 'passed', 'failed', 'skipped');

ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "thumbnailPath" TEXT;
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "thumbnailDataUrl" TEXT;
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "status" "PmAttachmentStatus" NOT NULL DEFAULT 'uploaded';
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "virusScanStatus" "PmAttachmentVirusScanStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "uploadedByUserId" INTEGER;
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "processingJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "cailTagsJson" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "coreFileId" INTEGER;
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "pm_attachments" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "pm_attachments_companyId_createdAt_idx" ON "pm_attachments"("companyId", "createdAt");
CREATE INDEX IF NOT EXISTS "pm_attachments_projectId_status_idx" ON "pm_attachments"("projectId", "status");

ALTER TABLE "pm_attachments" ADD CONSTRAINT "pm_attachments_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_attachments" ADD CONSTRAINT "pm_attachments_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "attachment_annotations" (
  "id" TEXT NOT NULL,
  "attachmentId" TEXT NOT NULL,
  "annotationType" TEXT NOT NULL,
  "annotationData" JSONB NOT NULL DEFAULT '{}',
  "createdByUserId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attachment_annotations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "attachment_annotations_clientSyncId_key" ON "attachment_annotations"("clientSyncId");
CREATE INDEX "attachment_annotations_attachmentId_createdAt_idx" ON "attachment_annotations"("attachmentId", "createdAt");
ALTER TABLE "attachment_annotations" ADD CONSTRAINT "attachment_annotations_attachmentId_fkey"
  FOREIGN KEY ("attachmentId") REFERENCES "pm_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachment_annotations" ADD CONSTRAINT "attachment_annotations_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "attachment_audit" (
  "id" TEXT NOT NULL,
  "attachmentId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "eventData" JSONB NOT NULL DEFAULT '{}',
  "actorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attachment_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "attachment_audit_attachmentId_createdAt_idx" ON "attachment_audit"("attachmentId", "createdAt");
ALTER TABLE "attachment_audit" ADD CONSTRAINT "attachment_audit_attachmentId_fkey"
  FOREIGN KEY ("attachmentId") REFERENCES "pm_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachment_audit" ADD CONSTRAINT "attachment_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
