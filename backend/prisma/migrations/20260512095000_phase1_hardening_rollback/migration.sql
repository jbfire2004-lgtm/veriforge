-- Rollback for:
-- 20260512090000_phase1_cleanup
-- 20260512091000_phase1_constraints
-- 20260512092000_phase1_indexes
-- 20260512093000_safety_station_alignment
-- 20260512094000_phase1_fk_hygiene
--
-- IMPORTANT:
-- - This rollback reverses schema objects (indexes/constraints/columns).
-- - It does NOT restore cleaned/deduplicated rows or original string casing.

BEGIN;

-- =========================
-- 1) Drop constraints added in 20260512091000_phase1_constraints
-- =========================

ALTER TABLE IF EXISTS "TrainingRequirement"
  DROP CONSTRAINT IF EXISTS "training_requirement_company_course_unique";

ALTER TABLE IF EXISTS "EquipmentTrainingRequirement"
  DROP CONSTRAINT IF EXISTS "equipment_training_requirement_unique_pair";

ALTER TABLE IF EXISTS "TrainingIngestionRun"
  DROP CONSTRAINT IF EXISTS "training_ingestion_run_status_check";

ALTER TABLE IF EXISTS "CoreActionItem"
  DROP CONSTRAINT IF EXISTS "core_action_item_status_check";

ALTER TABLE IF EXISTS "CoreActionItem"
  DROP CONSTRAINT IF EXISTS "core_action_item_priority_check";

ALTER TABLE IF EXISTS "Incident"
  DROP CONSTRAINT IF EXISTS "incident_status_check";

ALTER TABLE IF EXISTS "Incident"
  DROP CONSTRAINT IF EXISTS "incident_severity_check";

ALTER TABLE IF EXISTS "Inspection"
  DROP CONSTRAINT IF EXISTS "inspection_status_check";

ALTER TABLE IF EXISTS "TrainingRecord"
  DROP CONSTRAINT IF EXISTS "training_record_dates_check";

ALTER TABLE IF EXISTS "PmSafetyWorkflow"
  DROP CONSTRAINT IF EXISTS "pm_workflow_valid_window_check";

-- =========================
-- 2) Drop indexes added in 20260512092000_phase1_indexes
-- =========================

DROP INDEX IF EXISTS "idx_training_record_worker_expires";
DROP INDEX IF EXISTS "idx_training_record_certification";
DROP INDEX IF EXISTS "idx_training_record_provider";
DROP INDEX IF EXISTS "idx_training_ingestion_run_company_status_created";

DROP INDEX IF EXISTS "idx_pm_workflow_status_updated";
DROP INDEX IF EXISTS "idx_pm_workflow_company_status_updated";
DROP INDEX IF EXISTS "idx_pm_workflow_site_status_updated";
DROP INDEX IF EXISTS "idx_pm_workflow_event_type_created";

DROP INDEX IF EXISTS "idx_incident_company_status_created";
DROP INDEX IF EXISTS "idx_incident_site_status_created";
DROP INDEX IF EXISTS "idx_incident_worker_created";
DROP INDEX IF EXISTS "idx_incident_equipment_created";

DROP INDEX IF EXISTS "idx_document_worker_created";
DROP INDEX IF EXISTS "idx_document_equipment_created";
DROP INDEX IF EXISTS "idx_document_company_created";
DROP INDEX IF EXISTS "idx_document_type_deleted_created";

DROP INDEX IF EXISTS "idx_core_file_status_created";
DROP INDEX IF EXISTS "idx_core_file_user_created";

-- =========================
-- 3) Drop indexes added in 20260512094000_phase1_fk_hygiene
-- =========================

DROP INDEX IF EXISTS "idx_worker_company";
DROP INDEX IF EXISTS "idx_equipment_company";
DROP INDEX IF EXISTS "idx_core_action_item_company_status_due";
DROP INDEX IF EXISTS "idx_training_attestation_record_created";

-- =========================
-- 4) Revert SafetyStation alignment added in 20260512093000_safety_station_alignment
-- =========================

DROP INDEX IF EXISTS "idx_safety_station_site_active";
DROP INDEX IF EXISTS "safety_station_code_key";

ALTER TABLE IF EXISTS "SafetyStation"
  DROP COLUMN IF EXISTS "lastPing",
  DROP COLUMN IF EXISTS "active",
  DROP COLUMN IF EXISTS "code";

COMMIT;
