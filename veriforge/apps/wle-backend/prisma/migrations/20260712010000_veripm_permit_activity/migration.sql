-- VERIPM permit activity stream (FieldOS signatures, photos, notes, CSS impact)

CREATE TYPE "VeripmPermitActivityKind" AS ENUM (
  'created',
  'fieldos_pushed',
  'fieldos_webhook',
  'status_changed',
  'signature',
  'photo',
  'note',
  'hazard_control',
  'safety_linked',
  'work_order_updated',
  'incident_linked',
  'css_impact',
  'closed'
);

CREATE TABLE "veripm_permit_activity" (
  "activity_id" TEXT NOT NULL,
  "permit_id" TEXT NOT NULL,
  "kind" "VeripmPermitActivityKind" NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'veripm',
  "status_from" TEXT,
  "status_to" TEXT,
  "actor_user_id" INTEGER,
  "fieldos_task_id" TEXT,
  "summary" TEXT NOT NULL,
  "payload_json" JSONB NOT NULL DEFAULT '{}',
  "photo_url" TEXT,
  "signature_role" TEXT,
  "signature_name" TEXT,
  "css_delta" DOUBLE PRECISION,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "veripm_permit_activity_pkey" PRIMARY KEY ("activity_id")
);

CREATE INDEX "veripm_permit_activity_permit_id_occurred_at_idx"
  ON "veripm_permit_activity"("permit_id", "occurred_at");
CREATE INDEX "veripm_permit_activity_kind_occurred_at_idx"
  ON "veripm_permit_activity"("kind", "occurred_at");

ALTER TABLE "veripm_permit_activity"
  ADD CONSTRAINT "veripm_permit_activity_permit_id_fkey"
  FOREIGN KEY ("permit_id") REFERENCES "veripm_permits"("permit_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
