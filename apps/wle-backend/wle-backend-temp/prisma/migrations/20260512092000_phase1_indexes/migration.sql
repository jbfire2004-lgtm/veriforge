BEGIN;

CREATE INDEX IF NOT EXISTS "idx_training_record_worker_expires"
  ON "TrainingRecord" ("workerId", "expiresAt");

CREATE INDEX IF NOT EXISTS "idx_training_record_certification"
  ON "TrainingRecord" ("certificationId");

CREATE INDEX IF NOT EXISTS "idx_training_record_provider"
  ON "TrainingRecord" ("providerId");

CREATE INDEX IF NOT EXISTS "idx_training_ingestion_run_company_status_created"
  ON "TrainingIngestionRun" ("companyId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_pm_workflow_status_updated"
  ON "PmSafetyWorkflow" ("status", "updatedAt");

CREATE INDEX IF NOT EXISTS "idx_pm_workflow_company_status_updated"
  ON "PmSafetyWorkflow" ("companyId", "status", "updatedAt");

CREATE INDEX IF NOT EXISTS "idx_pm_workflow_site_status_updated"
  ON "PmSafetyWorkflow" ("siteId", "status", "updatedAt");

CREATE INDEX IF NOT EXISTS "idx_pm_workflow_event_type_created"
  ON "PmSafetyWorkflowEvent" ("workflowId", "eventType", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_incident_company_status_created"
  ON "Incident" ("companyId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_incident_site_status_created"
  ON "Incident" ("siteId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_incident_worker_created"
  ON "Incident" ("workerId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_incident_equipment_created"
  ON "Incident" ("equipmentId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_document_worker_created"
  ON "Document" ("workerId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_document_equipment_created"
  ON "Document" ("equipmentId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_document_company_created"
  ON "Document" ("companyId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_document_type_deleted_created"
  ON "Document" ("type", "deleted", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_core_file_status_created"
  ON "CoreFile" ("status", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_core_file_user_created"
  ON "CoreFile" ("userId", "createdAt");

COMMIT;
