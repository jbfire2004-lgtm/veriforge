-- PM Safety Meetings & Toolbox Talks System

CREATE TYPE "SafetyMeetingType" AS ENUM (
  'toolbox_talk',
  'tailgate_meeting',
  'safety_stand_down',
  'pre_task_meeting',
  'daily_safety_briefing',
  'weekly_safety_meeting',
  'monthly_safety_meeting',
  'project_kickoff_safety',
  'incident_review_meeting',
  'custom'
);

CREATE TYPE "SafetyMeetingStatus" AS ENUM (
  'draft',
  'published',
  'in_progress',
  'completed',
  'reviewed',
  'locked'
);

CREATE TYPE "SafetyMeetingReviewStatus" AS ENUM (
  'not_required',
  'pending',
  'approved',
  'rejected',
  'changes_requested'
);

CREATE TYPE "SafetyMeetingTemplateStatus" AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE "TopicLibraryScope" AS ENUM ('company', 'project');

CREATE TYPE "TopicLibraryCategoryCode" AS ENUM (
  'ppe',
  'fall_protection',
  'confined_space',
  'hot_work',
  'electrical_safety',
  'equipment_operation',
  'housekeeping',
  'environmental',
  'behavioral_safety',
  'sif_heca',
  'general'
);

CREATE TYPE "SafetyMeetingAttendeeStatus" AS ENUM (
  'expected',
  'present',
  'absent',
  'excused'
);

-- Extend CAIL source types for safety meetings
ALTER TYPE "CailSourceType" ADD VALUE IF NOT EXISTS 'safety_meeting';

CREATE TABLE "topic_library_categories" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "code" "TopicLibraryCategoryCode" NOT NULL DEFAULT 'general',
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "topic_library_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "topic_library_categories_company_code_company_scope_key"
  ON "topic_library_categories"("companyId", "code") WHERE "projectId" IS NULL;
CREATE UNIQUE INDEX "topic_library_categories_company_project_code_key"
  ON "topic_library_categories"("companyId", "projectId", "code") WHERE "projectId" IS NOT NULL;
CREATE INDEX "topic_library_categories_companyId_idx" ON "topic_library_categories"("companyId");

ALTER TABLE "topic_library_categories" ADD CONSTRAINT "topic_library_categories_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_library_categories" ADD CONSTRAINT "topic_library_categories_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "topic_library" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "categoryId" TEXT,
  "scope" "TopicLibraryScope" NOT NULL DEFAULT 'company',
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "discussionPoints" JSONB NOT NULL DEFAULT '[]',
  "requiredControls" JSONB NOT NULL DEFAULT '[]',
  "requiredAttachments" JSONB NOT NULL DEFAULT '[]',
  "isHighRisk" BOOLEAN NOT NULL DEFAULT false,
  "requiresSifReview" BOOLEAN NOT NULL DEFAULT false,
  "sifHecaTags" JSONB NOT NULL DEFAULT '[]',
  "sourceRefs" JSONB NOT NULL DEFAULT '[]',
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "topic_library_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "topic_library_companyId_projectId_idx" ON "topic_library"("companyId", "projectId");
CREATE INDEX "topic_library_categoryId_idx" ON "topic_library"("categoryId");
CREATE INDEX "topic_library_active_idx" ON "topic_library"("active");

ALTER TABLE "topic_library" ADD CONSTRAINT "topic_library_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_library" ADD CONSTRAINT "topic_library_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_library" ADD CONSTRAINT "topic_library_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "topic_library_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_templates" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "meetingType" "SafetyMeetingType" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "SafetyMeetingTemplateStatus" NOT NULL DEFAULT 'draft',
  "agendaJson" JSONB NOT NULL DEFAULT '[]',
  "requiredTopicIds" JSONB NOT NULL DEFAULT '[]',
  "publishedAt" TIMESTAMP(3),
  "publishedByUserId" INTEGER,
  "parentTemplateId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "safety_meeting_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "safety_meeting_templates_companyId_projectId_idx"
  ON "safety_meeting_templates"("companyId", "projectId");
CREATE INDEX "safety_meeting_templates_meetingType_status_idx"
  ON "safety_meeting_templates"("meetingType", "status");

ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_parentTemplateId_fkey"
  FOREIGN KEY ("parentTemplateId") REFERENCES "safety_meeting_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "safety_meetings" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "siteId" INTEGER,
  "templateId" TEXT,
  "meetingType" "SafetyMeetingType" NOT NULL,
  "customMeetingTypeLabel" TEXT,
  "status" "SafetyMeetingStatus" NOT NULL DEFAULT 'draft',
  "title" TEXT NOT NULL,
  "locationNote" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lockedAt" TIMESTAMP(3),
  "facilitatorWorkerId" INTEGER,
  "supervisorUserId" INTEGER,
  "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
  "reviewStatus" "SafetyMeetingReviewStatus" NOT NULL DEFAULT 'not_required',
  "reviewNotes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedByUserId" INTEGER,
  "qualityScore" INTEGER,
  "engagementScore" INTEGER,
  "cailEntryId" TEXT,
  "safetyStationId" INTEGER,
  "discussionNotes" TEXT,
  "hazardsDiscussed" JSONB NOT NULL DEFAULT '[]',
  "controlsDiscussed" JSONB NOT NULL DEFAULT '[]',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "clientSyncId" TEXT,
  "clientVersion" INTEGER NOT NULL DEFAULT 1,
  "deletedAt" TIMESTAMP(3),
  "createdByUserId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "safety_meetings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_meetings_clientSyncId_key" ON "safety_meetings"("clientSyncId");
CREATE UNIQUE INDEX "safety_meetings_cailEntryId_key" ON "safety_meetings"("cailEntryId");
CREATE INDEX "safety_meetings_projectId_status_idx" ON "safety_meetings"("projectId", "status");
CREATE INDEX "safety_meetings_companyId_meetingType_idx" ON "safety_meetings"("companyId", "meetingType");
CREATE INDEX "safety_meetings_scheduledAt_idx" ON "safety_meetings"("scheduledAt");
CREATE INDEX "safety_meetings_siteId_status_idx" ON "safety_meetings"("siteId", "status");

ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_siteId_fkey"
  FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "safety_meeting_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_facilitatorWorkerId_fkey"
  FOREIGN KEY ("facilitatorWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_supervisorUserId_fkey"
  FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_reviewedByUserId_fkey"
  FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_cailEntryId_fkey"
  FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_safetyStationId_fkey"
  FOREIGN KEY ("safetyStationId") REFERENCES "SafetyStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_topics" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "topicLibraryId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "title" TEXT NOT NULL,
  "discussionPoints" JSONB NOT NULL DEFAULT '[]',
  "requiredControls" JSONB NOT NULL DEFAULT '[]',
  "requiredActions" JSONB NOT NULL DEFAULT '[]',
  "notes" TEXT,
  "isHighRisk" BOOLEAN NOT NULL DEFAULT false,
  "sourceModule" TEXT,
  "sourceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "safety_meeting_topics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "safety_meeting_topics_meetingId_idx" ON "safety_meeting_topics"("meetingId");
ALTER TABLE "safety_meeting_topics" ADD CONSTRAINT "safety_meeting_topics_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_topics" ADD CONSTRAINT "safety_meeting_topics_topicLibraryId_fkey"
  FOREIGN KEY ("topicLibraryId") REFERENCES "topic_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_attendees" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "workerId" INTEGER NOT NULL,
  "status" "SafetyMeetingAttendeeStatus" NOT NULL DEFAULT 'expected',
  "checkedInAt" TIMESTAMP(3),
  "trainingValid" BOOLEAN,
  "equipmentAuthorized" BOOLEAN,
  "identityVerified" BOOLEAN NOT NULL DEFAULT false,
  "verificationMethod" TEXT,
  "notes" TEXT,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "safety_meeting_attendees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_meeting_attendees_meeting_worker_key"
  ON "safety_meeting_attendees"("meetingId", "workerId");
CREATE UNIQUE INDEX "safety_meeting_attendees_clientSyncId_key"
  ON "safety_meeting_attendees"("clientSyncId");
CREATE INDEX "safety_meeting_attendees_workerId_idx" ON "safety_meeting_attendees"("workerId");

ALTER TABLE "safety_meeting_attendees" ADD CONSTRAINT "safety_meeting_attendees_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_attendees" ADD CONSTRAINT "safety_meeting_attendees_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_signatures" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "attendeeId" TEXT,
  "role" TEXT NOT NULL,
  "signerUserId" INTEGER,
  "signerWorkerId" INTEGER,
  "signatureData" TEXT,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientSyncId" TEXT,
  CONSTRAINT "safety_meeting_signatures_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_meeting_signatures_clientSyncId_key"
  ON "safety_meeting_signatures"("clientSyncId");
CREATE INDEX "safety_meeting_signatures_meetingId_idx" ON "safety_meeting_signatures"("meetingId");

ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_attendeeId_fkey"
  FOREIGN KEY ("attendeeId") REFERENCES "safety_meeting_attendees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_signerUserId_fkey"
  FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_signerWorkerId_fkey"
  FOREIGN KEY ("signerWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_attachments" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "topicId" TEXT,
  "correctiveActionId" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "storageKey" TEXT,
  "dataUrl" TEXT,
  "annotationJson" JSONB,
  "phase" TEXT NOT NULL DEFAULT 'evidence',
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_meeting_attachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_meeting_attachments_clientSyncId_key"
  ON "safety_meeting_attachments"("clientSyncId");
CREATE INDEX "safety_meeting_attachments_meetingId_idx" ON "safety_meeting_attachments"("meetingId");

ALTER TABLE "safety_meeting_attachments" ADD CONSTRAINT "safety_meeting_attachments_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_attachments" ADD CONSTRAINT "safety_meeting_attachments_topicId_fkey"
  FOREIGN KEY ("topicId") REFERENCES "safety_meeting_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_attachments" ADD CONSTRAINT "safety_meeting_attachments_correctiveActionId_fkey"
  FOREIGN KEY ("correctiveActionId") REFERENCES "pm_corrective_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_corrective_actions" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "topicId" TEXT,
  "correctiveActionId" TEXT NOT NULL,
  "origin" TEXT NOT NULL DEFAULT 'discussion',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_meeting_corrective_actions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_meeting_corrective_actions_meeting_capa_key"
  ON "safety_meeting_corrective_actions"("meetingId", "correctiveActionId");
CREATE INDEX "safety_meeting_corrective_actions_correctiveActionId_idx"
  ON "safety_meeting_corrective_actions"("correctiveActionId");

ALTER TABLE "safety_meeting_corrective_actions" ADD CONSTRAINT "safety_meeting_corrective_actions_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_corrective_actions" ADD CONSTRAINT "safety_meeting_corrective_actions_topicId_fkey"
  FOREIGN KEY ("topicId") REFERENCES "safety_meeting_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_corrective_actions" ADD CONSTRAINT "safety_meeting_corrective_actions_correctiveActionId_fkey"
  FOREIGN KEY ("correctiveActionId") REFERENCES "pm_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "safety_meeting_audit" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_meeting_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "safety_meeting_audit_meetingId_createdAt_idx"
  ON "safety_meeting_audit"("meetingId", "createdAt");

ALTER TABLE "safety_meeting_audit" ADD CONSTRAINT "safety_meeting_audit_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_meeting_audit" ADD CONSTRAINT "safety_meeting_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Site access: required meeting attendance rules
CREATE TABLE "site_access_meeting_requirement" (
  "id" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "meetingType" "SafetyMeetingType" NOT NULL,
  "windowHours" INTEGER NOT NULL DEFAULT 24,
  "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_access_meeting_requirement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_access_meeting_requirement_project_type_zone_key"
  ON "site_access_meeting_requirement"("projectId", "meetingType", "zoneCode");
ALTER TABLE "site_access_meeting_requirement" ADD CONSTRAINT "site_access_meeting_requirement_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
