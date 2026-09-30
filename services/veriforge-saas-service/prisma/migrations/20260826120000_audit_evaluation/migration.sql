-- Audit & Evaluation module

CREATE TYPE "AuditEvaluationStatus" AS ENUM (
  'draft', 'assigned', 'in_review', 'scored', 'closed', 'cancelled'
);
CREATE TYPE "AuditFindingSeverity" AS ENUM (
  'critical', 'major', 'minor', 'observation'
);
CREATE TYPE "AuditFindingStatus" AS ENUM (
  'open', 'addressed', 'accepted', 'waived'
);
CREATE TYPE "CorrectiveActionStatus" AS ENUM (
  'open', 'in_progress', 'completed', 'waived', 'overdue'
);
CREATE TYPE "AuditQuestionType" AS ENUM (
  'score', 'yes_no', 'text', 'na'
);

CREATE TABLE "audit_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_templates_org_id_is_active_idx" ON "audit_templates"("org_id", "is_active");
CREATE INDEX "audit_templates_is_active_category_idx" ON "audit_templates"("is_active", "category");

ALTER TABLE "audit_templates"
  ADD CONSTRAINT "audit_templates_org_id_fkey"
  FOREIGN KEY ("org_id") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "audit_template_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "audit_template_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_template_sections_template_id_sort_order_idx"
  ON "audit_template_sections"("template_id", "sort_order");

ALTER TABLE "audit_template_sections"
  ADD CONSTRAINT "audit_template_sections_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "audit_templates"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "audit_template_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "section_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "help_text" TEXT,
    "question_type" "AuditQuestionType" NOT NULL DEFAULT 'score',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "max_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "document_category_hint" TEXT,
    CONSTRAINT "audit_template_questions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_template_questions_section_id_sort_order_idx"
  ON "audit_template_questions"("section_id", "sort_order");

ALTER TABLE "audit_template_questions"
  ADD CONSTRAINT "audit_template_questions_section_id_fkey"
  FOREIGN KEY ("section_id") REFERENCES "audit_template_sections"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "evaluation_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractor_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AuditEvaluationStatus" NOT NULL DEFAULT 'draft',
    "score" DOUBLE PRECISION,
    "section_scores" JSONB,
    "reviewer_id" UUID,
    "reviewer_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "created_by_id" UUID,
    "hiring_client_id" UUID,
    "directory_audit_id" UUID,
    "document_snapshot" JSONB,
    "notes" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evaluation_audits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "evaluation_audits_directory_audit_id_key"
  ON "evaluation_audits"("directory_audit_id");
CREATE INDEX "evaluation_audits_contractor_id_status_idx"
  ON "evaluation_audits"("contractor_id", "status");
CREATE INDEX "evaluation_audits_template_id_idx" ON "evaluation_audits"("template_id");
CREATE INDEX "evaluation_audits_reviewer_id_status_idx"
  ON "evaluation_audits"("reviewer_id", "status");
CREATE INDEX "evaluation_audits_hiring_client_id_idx"
  ON "evaluation_audits"("hiring_client_id");

ALTER TABLE "evaluation_audits"
  ADD CONSTRAINT "evaluation_audits_contractor_id_fkey"
  FOREIGN KEY ("contractor_id") REFERENCES "contractor_profiles"("contractor_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluation_audits"
  ADD CONSTRAINT "evaluation_audits_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "audit_templates"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evaluation_audits"
  ADD CONSTRAINT "evaluation_audits_directory_audit_id_fkey"
  FOREIGN KEY ("directory_audit_id") REFERENCES "contractor_audits"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "audit_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "score_value" DOUBLE PRECISION,
    "answer_text" TEXT,
    "is_na" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_responses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "audit_responses_audit_id_question_id_key"
  ON "audit_responses"("audit_id", "question_id");
CREATE INDEX "audit_responses_audit_id_idx" ON "audit_responses"("audit_id");

ALTER TABLE "audit_responses"
  ADD CONSTRAINT "audit_responses_audit_id_fkey"
  FOREIGN KEY ("audit_id") REFERENCES "evaluation_audits"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_responses"
  ADD CONSTRAINT "audit_responses_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "audit_template_questions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "audit_findings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "question_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "AuditFindingSeverity" NOT NULL DEFAULT 'minor',
    "status" "AuditFindingStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_findings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_findings_audit_id_status_idx" ON "audit_findings"("audit_id", "status");
CREATE INDEX "audit_findings_audit_id_severity_idx" ON "audit_findings"("audit_id", "severity");

ALTER TABLE "audit_findings"
  ADD CONSTRAINT "audit_findings_audit_id_fkey"
  FOREIGN KEY ("audit_id") REFERENCES "evaluation_audits"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_findings"
  ADD CONSTRAINT "audit_findings_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "audit_template_questions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "corrective_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "finding_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner_name" TEXT,
    "owner_id" UUID,
    "due_date" TIMESTAMP(3),
    "status" "CorrectiveActionStatus" NOT NULL DEFAULT 'open',
    "completed_at" TIMESTAMP(3),
    "evidence_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "corrective_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "corrective_actions_audit_id_status_idx"
  ON "corrective_actions"("audit_id", "status");
CREATE INDEX "corrective_actions_finding_id_idx" ON "corrective_actions"("finding_id");
CREATE INDEX "corrective_actions_due_date_status_idx"
  ON "corrective_actions"("due_date", "status");

ALTER TABLE "corrective_actions"
  ADD CONSTRAINT "corrective_actions_audit_id_fkey"
  FOREIGN KEY ("audit_id") REFERENCES "evaluation_audits"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corrective_actions"
  ADD CONSTRAINT "corrective_actions_finding_id_fkey"
  FOREIGN KEY ("finding_id") REFERENCES "audit_findings"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
