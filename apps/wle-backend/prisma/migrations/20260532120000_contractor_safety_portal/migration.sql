-- Contractor Safety Portal

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CONTRACTOR_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CONTRACTOR_USER';

CREATE TABLE "pm_contractor_portal_membership" (
  "id" TEXT NOT NULL,
  "prime_company_id" INTEGER NOT NULL,
  "contractor_company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_contractor_portal_membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pm_contractor_finding_acknowledgment" (
  "id" TEXT NOT NULL,
  "deficiency_id" TEXT NOT NULL,
  "contractor_company_id" INTEGER NOT NULL,
  "acknowledged_by_user_id" INTEGER NOT NULL,
  "notes" TEXT,
  "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_contractor_finding_acknowledgment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pm_contractor_portal_message" (
  "id" TEXT NOT NULL,
  "prime_company_id" INTEGER NOT NULL,
  "contractor_company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "sender_user_id" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "related_type" TEXT,
  "related_id" TEXT,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pm_contractor_portal_message_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pm_contractor_portal_membership_prime_company_id_contractor__key"
  ON "pm_contractor_portal_membership"("prime_company_id", "contractor_company_id", "project_id");

CREATE INDEX "pm_contractor_portal_membership_contractor_company_id_active_idx"
  ON "pm_contractor_portal_membership"("contractor_company_id", "active");

CREATE UNIQUE INDEX "pm_contractor_finding_acknowledgment_deficiency_id_contractor__key"
  ON "pm_contractor_finding_acknowledgment"("deficiency_id", "contractor_company_id");

CREATE INDEX "pm_contractor_finding_acknowledgment_contractor_company_id_ackn_idx"
  ON "pm_contractor_finding_acknowledgment"("contractor_company_id", "acknowledged_at");

CREATE INDEX "pm_contractor_portal_message_contractor_company_id_created_at_idx"
  ON "pm_contractor_portal_message"("contractor_company_id", "created_at");

CREATE INDEX "pm_contractor_portal_message_prime_company_id_contractor_compa_idx"
  ON "pm_contractor_portal_message"("prime_company_id", "contractor_company_id");

ALTER TABLE "pm_contractor_portal_membership"
  ADD CONSTRAINT "pm_contractor_portal_membership_prime_company_id_fkey"
  FOREIGN KEY ("prime_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_portal_membership"
  ADD CONSTRAINT "pm_contractor_portal_membership_contractor_company_id_fkey"
  FOREIGN KEY ("contractor_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_portal_membership"
  ADD CONSTRAINT "pm_contractor_portal_membership_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_finding_acknowledgment"
  ADD CONSTRAINT "pm_contractor_finding_acknowledgment_deficiency_id_fkey"
  FOREIGN KEY ("deficiency_id") REFERENCES "pm_inspection_deficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_finding_acknowledgment"
  ADD CONSTRAINT "pm_contractor_finding_acknowledgment_contractor_company_id_fkey"
  FOREIGN KEY ("contractor_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_finding_acknowledgment"
  ADD CONSTRAINT "pm_contractor_finding_acknowledgment_acknowledged_by_user_id_fkey"
  FOREIGN KEY ("acknowledged_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_portal_message"
  ADD CONSTRAINT "pm_contractor_portal_message_prime_company_id_fkey"
  FOREIGN KEY ("prime_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_portal_message"
  ADD CONSTRAINT "pm_contractor_portal_message_contractor_company_id_fkey"
  FOREIGN KEY ("contractor_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pm_contractor_portal_message"
  ADD CONSTRAINT "pm_contractor_portal_message_sender_user_id_fkey"
  FOREIGN KEY ("sender_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
