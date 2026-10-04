-- PM SDS & Document Control

CREATE TYPE "PmSdsCategory" AS ENUM (
  'CHEMICAL', 'FUEL', 'SOLVENT', 'ADHESIVE', 'CLEANING_AGENT', 'HAZARDOUS_MATERIAL', 'OTHER'
);

CREATE TYPE "PmDocumentStatus" AS ENUM (
  'draft', 'review', 'approved', 'published', 'superseded', 'archived'
);

CREATE TYPE "PmControlledDocumentType" AS ENUM (
  'policy', 'procedure', 'sop', 'manual', 'manufacturer_instruction',
  'safety_bulletin', 'emergency_plan', 'training', 'equipment_manual', 'project_specific'
);

-- Extend SDS
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "category" "PmSdsCategory" NOT NULL DEFAULT 'CHEMICAL';
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "status" "PmDocumentStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "parentDocumentId" TEXT;
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "whmisJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "metadataJson" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "reviewDueAt" TIMESTAMP(3);
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "requiresAck" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "clientSyncId" TEXT;
ALTER TABLE "sds_document" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "sds_document_clientSyncId_key" ON "sds_document"("clientSyncId");
CREATE INDEX IF NOT EXISTS "sds_document_projectId_status_idx" ON "sds_document"("projectId", "status");
CREATE INDEX IF NOT EXISTS "sds_document_expiresAt_idx" ON "sds_document"("expiresAt");
CREATE INDEX IF NOT EXISTS "sds_document_parentDocumentId_idx" ON "sds_document"("parentDocumentId");

ALTER TABLE "sds_document" ADD CONSTRAINT "sds_document_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sds_document" ADD CONSTRAINT "sds_document_parentDocumentId_fkey"
  FOREIGN KEY ("parentDocumentId") REFERENCES "sds_document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Chemical inventory
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "productName" TEXT;
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "containerSize" TEXT;
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "storageClass" TEXT;
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "incompatibleWith" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "chemicalExpiry" TIMESTAMP(3);
ALTER TABLE "chemical_inventory_item" ADD COLUMN IF NOT EXISTS "missingSdsFlag" BOOLEAN NOT NULL DEFAULT false;

UPDATE "chemical_inventory_item" ci
SET "companyId" = COALESCE(
  (SELECT p."companyId" FROM "Project" p WHERE p."siteId" = ci."siteId" LIMIT 1),
  (SELECT sd."companyId" FROM "sds_document" sd WHERE sd."id" = ci."sdsDocumentId"),
  1
)
WHERE "companyId" IS NULL;

ALTER TABLE "chemical_inventory_item" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "chemical_inventory_item" ALTER COLUMN "sdsDocumentId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "chemical_inventory_item_projectId_idx" ON "chemical_inventory_item"("projectId");
CREATE INDEX IF NOT EXISTS "chemical_inventory_item_chemicalExpiry_idx" ON "chemical_inventory_item"("chemicalExpiry");

ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Policy documents
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "projectId" INTEGER;
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "versionNum" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "status" "PmDocumentStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "requiresAck" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "parentDocumentId" TEXT;
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "reviewDueAt" TIMESTAMP(3);
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "supersededAt" TIMESTAMP(3);
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "clientSyncId" TEXT;
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "policy_document_clientSyncId_key" ON "policy_document"("clientSyncId");
CREATE INDEX IF NOT EXISTS "policy_document_projectId_status_idx" ON "policy_document"("projectId", "status");

ALTER TABLE "policy_document" ADD CONSTRAINT "policy_document_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SDS versions & attachments
CREATE TABLE "sds_version" (
  "id" TEXT NOT NULL,
  "sdsDocumentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "authorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sds_version_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sds_version_sdsDocumentId_version_key" ON "sds_version"("sdsDocumentId", "version");
ALTER TABLE "sds_version" ADD CONSTRAINT "sds_version_sdsDocumentId_fkey"
  FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "sds_attachment" (
  "id" TEXT NOT NULL,
  "sdsDocumentId" TEXT NOT NULL,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "coreFileId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sds_attachment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sds_attachment_clientSyncId_key" ON "sds_attachment"("clientSyncId");
CREATE INDEX "sds_attachment_sdsDocumentId_idx" ON "sds_attachment"("sdsDocumentId");
ALTER TABLE "sds_attachment" ADD CONSTRAINT "sds_attachment_sdsDocumentId_fkey"
  FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Controlled documents
CREATE TABLE "pm_controlled_document" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "documentType" "PmControlledDocumentType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "versionNum" INTEGER NOT NULL DEFAULT 1,
  "status" "PmDocumentStatus" NOT NULL DEFAULT 'draft',
  "storageKey" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "equipmentId" INTEGER,
  "requiresAck" BOOLEAN NOT NULL DEFAULT false,
  "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false,
  "reviewDueAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "supersededById" TEXT,
  "parentDocumentId" TEXT,
  "clientSyncId" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pm_controlled_document_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pm_controlled_document_clientSyncId_key" ON "pm_controlled_document"("clientSyncId");
CREATE INDEX "pm_controlled_document_companyId_documentType_status_idx"
  ON "pm_controlled_document"("companyId", "documentType", "status");
CREATE INDEX "pm_controlled_document_projectId_status_idx" ON "pm_controlled_document"("projectId", "status");
CREATE INDEX "pm_controlled_document_equipmentId_idx" ON "pm_controlled_document"("equipmentId");

ALTER TABLE "pm_controlled_document" ADD CONSTRAINT "pm_controlled_document_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_controlled_document" ADD CONSTRAINT "pm_controlled_document_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pm_controlled_document" ADD CONSTRAINT "pm_controlled_document_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "document_version" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "authorId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "document_version_documentId_version_key" ON "document_version"("documentId", "version");
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "pm_controlled_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "document_attachment" (
  "id" TEXT NOT NULL,
  "documentId" TEXT,
  "sdsDocumentId" TEXT,
  "storageKey" TEXT,
  "fileName" TEXT,
  "mimeType" TEXT,
  "dataUrl" TEXT,
  "coreFileId" INTEGER,
  "clientSyncId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_attachment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "document_attachment_clientSyncId_key" ON "document_attachment"("clientSyncId");
CREATE INDEX "document_attachment_documentId_idx" ON "document_attachment"("documentId");
CREATE INDEX "document_attachment_sdsDocumentId_idx" ON "document_attachment"("sdsDocumentId");
ALTER TABLE "document_attachment" ADD CONSTRAINT "document_attachment_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "pm_controlled_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "document_acknowledgment" (
  "id" TEXT NOT NULL,
  "workerId" INTEGER NOT NULL,
  "sdsDocumentId" TEXT,
  "controlledDocumentId" TEXT,
  "policyDocumentId" TEXT,
  "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signatureData" TEXT,
  "clientSyncId" TEXT,
  CONSTRAINT "document_acknowledgment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "document_acknowledgment_clientSyncId_key" ON "document_acknowledgment"("clientSyncId");
CREATE INDEX "document_acknowledgment_workerId_idx" ON "document_acknowledgment"("workerId");
CREATE INDEX "document_acknowledgment_controlledDocumentId_idx" ON "document_acknowledgment"("controlledDocumentId");
CREATE INDEX "document_acknowledgment_sdsDocumentId_idx" ON "document_acknowledgment"("sdsDocumentId");

ALTER TABLE "document_acknowledgment" ADD CONSTRAINT "document_acknowledgment_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_acknowledgment" ADD CONSTRAINT "document_acknowledgment_sdsDocumentId_fkey"
  FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_acknowledgment" ADD CONSTRAINT "document_acknowledgment_controlledDocumentId_fkey"
  FOREIGN KEY ("controlledDocumentId") REFERENCES "pm_controlled_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "manufacturer_instruction" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "equipmentId" INTEGER,
  "controlledDocId" TEXT,
  "title" TEXT NOT NULL,
  "manufacturer" TEXT,
  "modelNumber" TEXT,
  "revisionDate" TIMESTAMP(3),
  "outdatedAt" TIMESTAMP(3),
  "storageKey" TEXT,
  "hazardHints" JSONB NOT NULL DEFAULT '[]',
  "controlHints" JSONB NOT NULL DEFAULT '[]',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "manufacturer_instruction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "manufacturer_instruction_controlledDocId_key" ON "manufacturer_instruction"("controlledDocId");
CREATE INDEX "manufacturer_instruction_companyId_equipmentId_idx" ON "manufacturer_instruction"("companyId", "equipmentId");

ALTER TABLE "manufacturer_instruction" ADD CONSTRAINT "manufacturer_instruction_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manufacturer_instruction" ADD CONSTRAINT "manufacturer_instruction_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "manufacturer_instruction" ADD CONSTRAINT "manufacturer_instruction_controlledDocId_fkey"
  FOREIGN KEY ("controlledDocId") REFERENCES "pm_controlled_document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "document_audit" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "document_audit_entityType_entityId_createdAt_idx"
  ON "document_audit"("entityType", "entityId", "createdAt");
ALTER TABLE "document_audit" ADD CONSTRAINT "document_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
