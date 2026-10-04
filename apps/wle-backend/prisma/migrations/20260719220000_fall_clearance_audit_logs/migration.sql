-- Fall clearance calculation audit logs

CREATE TABLE IF NOT EXISTS "clearance_audit_logs" (
  "id" TEXT NOT NULL,
  "site_id" TEXT,
  "project_id" TEXT,
  "equipment_id" TEXT,
  "user_id" INTEGER,
  "config" JSONB NOT NULL,
  "result" JSONB NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clearance_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "clearance_audit_logs_site_id_timestamp_idx"
  ON "clearance_audit_logs"("site_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "clearance_audit_logs_project_id_timestamp_idx"
  ON "clearance_audit_logs"("project_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "clearance_audit_logs_equipment_id_timestamp_idx"
  ON "clearance_audit_logs"("equipment_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "clearance_audit_logs_user_id_timestamp_idx"
  ON "clearance_audit_logs"("user_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "clearance_audit_logs_timestamp_idx"
  ON "clearance_audit_logs"("timestamp" DESC);
