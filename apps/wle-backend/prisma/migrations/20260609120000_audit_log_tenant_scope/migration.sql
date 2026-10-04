-- Structured audit log: tenant scope + string entity ids for UUID resources
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER;

ALTER TABLE "AuditLog" ALTER COLUMN "entityId" TYPE TEXT USING (
  CASE WHEN "entityId" IS NULL THEN NULL ELSE "entityId"::TEXT END
);

CREATE INDEX IF NOT EXISTS "idx_audit_log_tenant_created" ON "AuditLog"("tenantId", "createdAt");
