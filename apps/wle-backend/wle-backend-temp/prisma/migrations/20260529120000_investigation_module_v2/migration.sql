-- Investigation module upgrade: guided flow + unified CAPA links

CREATE TYPE "PmInvestigationStatus" AS ENUM (
  'not_started',
  'evidence_gathering',
  'analysis',
  'root_cause',
  'capa_planning',
  'review',
  'closed'
);

ALTER TABLE "pm_safety_event_corrective_action"
  ADD COLUMN IF NOT EXISTS "unified_corrective_action_id" TEXT,
  ADD COLUMN IF NOT EXISTS "subcontractor_company_id" INTEGER;

CREATE TABLE "pm_safety_event_investigation" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "status" "PmInvestigationStatus" NOT NULL DEFAULT 'not_started',
  "current_step" INTEGER NOT NULL DEFAULT 0,
  "narrative" TEXT,
  "immediate_actions" TEXT,
  "guided_answers_json" JSONB NOT NULL DEFAULT '{}',
  "causal_tree_json" JSONB NOT NULL DEFAULT '{}',
  "executive_summary" TEXT,
  "lead_investigator_id" INTEGER,
  "started_at" TIMESTAMP(3),
  "closed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_safety_event_investigation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_safety_event_investigation_event_id_key"
  ON "pm_safety_event_investigation"("event_id");

ALTER TABLE "pm_safety_event_investigation"
  ADD CONSTRAINT "pm_safety_event_investigation_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_safety_event_investigation"
  ADD CONSTRAINT "pm_safety_event_investigation_lead_investigator_id_fkey"
  FOREIGN KEY ("lead_investigator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
