-- Phase 1 follow-up: operational indexes, FK hygiene for assigner fields,
-- notification/audit columns used by Nest services, ChatMember dedupe + uniqueness,
-- and validation of the CoreActionItem parent XOR constraint after cleanup.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) AuditLog — align with AuditService (ip / userAgent; entity nullable)
-- ---------------------------------------------------------------------------
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "ip" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

ALTER TABLE "AuditLog" ALTER COLUMN "entity" DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- 2) Notification — align with NotificationsService (nullable userId, status)
-- ---------------------------------------------------------------------------
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'SENT';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_status_check'
  ) THEN
    ALTER TABLE "Notification"
      ADD CONSTRAINT "notification_status_check"
      CHECK ("status" IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED'));
  END IF;
END $$;

ALTER TABLE "Notification" ALTER COLUMN "userId" DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- 3) ChatMember — remove duplicate (roomId, userId) rows, then enforce unique
-- ---------------------------------------------------------------------------
DELETE FROM "ChatMember" AS cm
USING "ChatMember" AS keep
WHERE cm."roomId" = keep."roomId"
  AND cm."userId" = keep."userId"
  AND cm."id" > keep."id";

CREATE UNIQUE INDEX IF NOT EXISTS "ChatMember_roomId_userId_key"
  ON "ChatMember" ("roomId", "userId");

-- ---------------------------------------------------------------------------
-- 4) assignedBy → User (nullable assigner); clear orphans before FK
-- ---------------------------------------------------------------------------
UPDATE "WorkerAssignment"
SET "assignedBy" = NULL
WHERE "assignedBy" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = "WorkerAssignment"."assignedBy");

UPDATE "EquipmentAssignment"
SET "assignedBy" = NULL
WHERE "assignedBy" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = "EquipmentAssignment"."assignedBy");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WorkerAssignment_assignedBy_fkey'
  ) THEN
    ALTER TABLE "WorkerAssignment"
      ADD CONSTRAINT "WorkerAssignment_assignedBy_fkey"
      FOREIGN KEY ("assignedBy") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EquipmentAssignment_assignedBy_fkey'
  ) THEN
    ALTER TABLE "EquipmentAssignment"
      ADD CONSTRAINT "EquipmentAssignment_assignedBy_fkey"
      FOREIGN KEY ("assignedBy") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5) Operational indexes (list/detail APIs, dashboards, chat history)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_worker_assignment_worker_ended"
  ON "WorkerAssignment" ("workerId", "endedAt");

CREATE INDEX IF NOT EXISTS "idx_worker_assignment_equipment_ended"
  ON "WorkerAssignment" ("equipmentId", "endedAt");

CREATE INDEX IF NOT EXISTS "idx_worker_assignment_site_ended"
  ON "WorkerAssignment" ("siteId", "endedAt");

CREATE INDEX IF NOT EXISTS "idx_worker_assignment_company"
  ON "WorkerAssignment" ("companyId");

CREATE INDEX IF NOT EXISTS "idx_equipment_assignment_equipment_ended"
  ON "EquipmentAssignment" ("equipmentId", "endedAt");

CREATE INDEX IF NOT EXISTS "idx_equipment_assignment_worker_ended"
  ON "EquipmentAssignment" ("workerId", "endedAt");

CREATE INDEX IF NOT EXISTS "idx_equipment_assignment_company"
  ON "EquipmentAssignment" ("companyId");

CREATE INDEX IF NOT EXISTS "idx_credential_worker"
  ON "Credential" ("workerId");

CREATE INDEX IF NOT EXISTS "idx_incident_comment_incident_created"
  ON "IncidentComment" ("incidentId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_investigation_incident"
  ON "Investigation" ("incidentId");

CREATE INDEX IF NOT EXISTS "idx_inspection_site_status"
  ON "Inspection" ("siteId", "status");

CREATE INDEX IF NOT EXISTS "idx_inspection_equipment"
  ON "Inspection" ("equipmentId");

CREATE INDEX IF NOT EXISTS "idx_inspection_worker"
  ON "Inspection" ("workerId");

CREATE INDEX IF NOT EXISTS "idx_digital_signoff_site_created"
  ON "DigitalSignoff" ("siteId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_digital_signoff_worker_created"
  ON "DigitalSignoff" ("workerId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_notification_user_created"
  ON "Notification" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_audit_log_user_created"
  ON "AuditLog" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_audit_log_entity"
  ON "AuditLog" ("entity", "entityId");

CREATE INDEX IF NOT EXISTS "idx_chat_message_room_created"
  ON "ChatMessage" ("roomId", "createdAt");

-- ---------------------------------------------------------------------------
-- 6) CoreActionItem parent XOR — validate after historical data is clean
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'CoreActionItem'
      AND c.conname = 'core_action_item_parent_xor_chk'
      AND c.convalidated = false
  ) THEN
    ALTER TABLE "CoreActionItem" VALIDATE CONSTRAINT "core_action_item_parent_xor_chk";
  END IF;
END $$;

COMMIT;
