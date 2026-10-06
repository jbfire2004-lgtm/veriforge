BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_requirement_company_course_unique'
  ) THEN
    ALTER TABLE "TrainingRequirement"
      ADD CONSTRAINT "training_requirement_company_course_unique"
      UNIQUE ("companyId", "courseName");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'equipment_training_requirement_unique_pair'
  ) THEN
    ALTER TABLE "EquipmentTrainingRequirement"
      ADD CONSTRAINT "equipment_training_requirement_unique_pair"
      UNIQUE ("equipmentId", "certificationId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_ingestion_run_status_check'
  ) THEN
    ALTER TABLE "TrainingIngestionRun"
      ADD CONSTRAINT "training_ingestion_run_status_check"
      CHECK ("status" IN ('PENDING','PROCESSING','COMPLETED','FAILED'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'core_action_item_status_check'
  ) THEN
    ALTER TABLE "CoreActionItem"
      ADD CONSTRAINT "core_action_item_status_check"
      CHECK ("status" IN ('OPEN','IN_PROGRESS','BLOCKED','DONE','CANCELLED'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'core_action_item_priority_check'
  ) THEN
    ALTER TABLE "CoreActionItem"
      ADD CONSTRAINT "core_action_item_priority_check"
      CHECK ("priority" IN ('LOW','NORMAL','HIGH','CRITICAL'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incident_status_check'
  ) THEN
    ALTER TABLE "Incident"
      ADD CONSTRAINT "incident_status_check"
      CHECK ("status" IN ('OPEN','IN_REVIEW','ACTION_REQUIRED','CLOSED'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incident_severity_check'
  ) THEN
    ALTER TABLE "Incident"
      ADD CONSTRAINT "incident_severity_check"
      CHECK ("severity" IN ('LOW','MEDIUM','HIGH','CRITICAL'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inspection_status_check'
  ) THEN
    ALTER TABLE "Inspection"
      ADD CONSTRAINT "inspection_status_check"
      CHECK ("status" IN ('PENDING','IN_PROGRESS','PASSED','FAILED','CLOSED'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_record_dates_check'
  ) THEN
    ALTER TABLE "TrainingRecord"
      ADD CONSTRAINT "training_record_dates_check"
      CHECK ("expiresAt" IS NULL OR "issuedAt" <= "expiresAt");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pm_workflow_valid_window_check'
  ) THEN
    ALTER TABLE "PmSafetyWorkflow"
      ADD CONSTRAINT "pm_workflow_valid_window_check"
      CHECK ("validTo" IS NULL OR "validFrom" IS NULL OR "validFrom" <= "validTo");
  END IF;
END $$;

COMMIT;
