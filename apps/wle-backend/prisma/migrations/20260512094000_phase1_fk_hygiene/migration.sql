BEGIN;

CREATE INDEX IF NOT EXISTS "idx_worker_company"
  ON "Worker" ("companyId");

CREATE INDEX IF NOT EXISTS "idx_equipment_company"
  ON "Equipment" ("companyId");

CREATE INDEX IF NOT EXISTS "idx_core_action_item_company_status_due"
  ON "CoreActionItem" ("companyId", "status", "dueAt");

CREATE INDEX IF NOT EXISTS "idx_training_attestation_record_created"
  ON "TrainingAttestation" ("trainingRecordId", "createdAt");

COMMIT;
