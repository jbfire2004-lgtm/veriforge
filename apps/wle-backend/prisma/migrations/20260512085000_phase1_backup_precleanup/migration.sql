-- Preflight backup for Phase 1 cleanup/hardening.
-- Run before:
-- 20260512090000_phase1_cleanup
-- 20260512091000_phase1_constraints
-- 20260512092000_phase1_indexes
-- 20260512093000_safety_station_alignment
-- 20260512094000_phase1_fk_hygiene

BEGIN;

-- Central backup schema keeps snapshots isolated from app tables.
CREATE SCHEMA IF NOT EXISTS backup_phase1;

-- 1) Full-table snapshot for dedupe targets
CREATE TABLE IF NOT EXISTS backup_phase1.training_requirement_precleanup AS
SELECT tr.*, now()::timestamp(3) AS backup_created_at
FROM "TrainingRequirement" tr
WHERE false;

INSERT INTO backup_phase1.training_requirement_precleanup
SELECT tr.*, now()::timestamp(3) AS backup_created_at
FROM "TrainingRequirement" tr;

CREATE TABLE IF NOT EXISTS backup_phase1.equipment_training_requirement_precleanup AS
SELECT etr.*, now()::timestamp(3) AS backup_created_at
FROM "EquipmentTrainingRequirement" etr
WHERE false;

INSERT INTO backup_phase1.equipment_training_requirement_precleanup
SELECT etr.*, now()::timestamp(3) AS backup_created_at
FROM "EquipmentTrainingRequirement" etr;

-- 2) Field-level snapshots for normalized status/priority columns
CREATE TABLE IF NOT EXISTS backup_phase1.training_ingestion_run_status_precleanup AS
SELECT
  tir."id",
  tir."status",
  now()::timestamp(3) AS backup_created_at
FROM "TrainingIngestionRun" tir
WHERE false;

INSERT INTO backup_phase1.training_ingestion_run_status_precleanup
SELECT
  tir."id",
  tir."status",
  now()::timestamp(3) AS backup_created_at
FROM "TrainingIngestionRun" tir;

CREATE TABLE IF NOT EXISTS backup_phase1.core_action_item_state_precleanup AS
SELECT
  cai."id",
  cai."status",
  cai."priority",
  now()::timestamp(3) AS backup_created_at
FROM "CoreActionItem" cai
WHERE false;

INSERT INTO backup_phase1.core_action_item_state_precleanup
SELECT
  cai."id",
  cai."status",
  cai."priority",
  now()::timestamp(3) AS backup_created_at
FROM "CoreActionItem" cai;

CREATE TABLE IF NOT EXISTS backup_phase1.incident_state_precleanup AS
SELECT
  i."id",
  i."status",
  i."severity",
  now()::timestamp(3) AS backup_created_at
FROM "Incident" i
WHERE false;

INSERT INTO backup_phase1.incident_state_precleanup
SELECT
  i."id",
  i."status",
  i."severity",
  now()::timestamp(3) AS backup_created_at
FROM "Incident" i;

CREATE TABLE IF NOT EXISTS backup_phase1.inspection_status_precleanup AS
SELECT
  ins."id",
  ins."status",
  now()::timestamp(3) AS backup_created_at
FROM "Inspection" ins
WHERE false;

INSERT INTO backup_phase1.inspection_status_precleanup
SELECT
  ins."id",
  ins."status",
  now()::timestamp(3) AS backup_created_at
FROM "Inspection" ins;

COMMIT;
