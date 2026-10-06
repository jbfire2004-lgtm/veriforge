-- Vera Core: global registry, company/equipment links, projects, union halls

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'REMOVED', 'COMPLETED');
CREATE TYPE "LinkComplianceStatus" AS ENUM ('COMPLIANT', 'NEEDS_ATTENTION', 'NON_COMPLIANT', 'LOCKED_OUT');
CREATE TYPE "UnionMembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ENDED');

-- Extend UserRole (idempotent via DO block)
DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'UNION_HALL_ADMIN';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'COMPANY_ADMIN';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User scoping
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "unionHallId" INTEGER;

-- Worker global identity
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "qrToken" TEXT;
ALTER TABLE "Worker" ADD COLUMN IF NOT EXISTS "unionNumber" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Worker_email_key" ON "Worker"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Worker_qrToken_key" ON "Worker"("qrToken");
CREATE INDEX IF NOT EXISTS "idx_worker_name" ON "Worker"("lastName", "firstName");
CREATE INDEX IF NOT EXISTS "idx_worker_phone" ON "Worker"("phone");

-- Equipment global identity
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "assetTag" TEXT;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "qrToken" TEXT;
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "lockedOutAt" TIMESTAMP(3);
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "lockoutReason" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Equipment_qrToken_key" ON "Equipment"("qrToken");
CREATE INDEX IF NOT EXISTS "idx_equipment_serial" ON "Equipment"("serialNumber");
CREATE INDEX IF NOT EXISTS "idx_equipment_asset_tag" ON "Equipment"("assetTag");

-- CompanyLink
CREATE TABLE "CompanyLink" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "role" TEXT,
    "trade" TEXT,
    "visibilityRules" JSONB,
    CONSTRAINT "CompanyLink_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_company_link_company_active" ON "CompanyLink"("companyId", "active");
CREATE INDEX "idx_company_link_worker_active" ON "CompanyLink"("workerId", "active");
CREATE INDEX "idx_company_link_worker_company" ON "CompanyLink"("workerId", "companyId");
ALTER TABLE "CompanyLink" ADD CONSTRAINT "CompanyLink_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyLink" ADD CONSTRAINT "CompanyLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- EquipmentLink
CREATE TABLE "EquipmentLink" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "complianceStatus" "LinkComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',
    CONSTRAINT "EquipmentLink_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_equipment_link_company_active" ON "EquipmentLink"("companyId", "active");
CREATE INDEX "idx_equipment_link_equipment_active" ON "EquipmentLink"("equipmentId", "active");
ALTER TABLE "EquipmentLink" ADD CONSTRAINT "EquipmentLink_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentLink" ADD CONSTRAINT "EquipmentLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EquipmentLinkWorker" (
    "equipmentLinkId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentLinkWorker_pkey" PRIMARY KEY ("equipmentLinkId","workerId")
);
ALTER TABLE "EquipmentLinkWorker" ADD CONSTRAINT "EquipmentLinkWorker_equipmentLinkId_fkey" FOREIGN KEY ("equipmentLinkId") REFERENCES "EquipmentLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentLinkWorker" ADD CONSTRAINT "EquipmentLinkWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Project
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_project_company_status" ON "Project"("companyId", "status");
CREATE INDEX "idx_project_site" ON "Project"("siteId");
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ProjectAssignment
CREATE TABLE "ProjectAssignment" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_project_assignment_project_status" ON "ProjectAssignment"("projectId", "status");
CREATE INDEX "idx_project_assignment_worker_status" ON "ProjectAssignment"("workerId", "status");
CREATE INDEX "idx_project_assignment_company" ON "ProjectAssignment"("companyId");
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- EquipmentProjectAssignment
CREATE TABLE "EquipmentProjectAssignment" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "EquipmentProjectAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_equipment_project_assignment_project_status" ON "EquipmentProjectAssignment"("projectId", "status");
CREATE INDEX "idx_equipment_project_assignment_equipment_status" ON "EquipmentProjectAssignment"("equipmentId", "status");
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UnionHall
CREATE TABLE "UnionHall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "localNumber" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnionHall_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UnionMembership" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "memberNumber" TEXT,
    "status" "UnionMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "UnionMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "union_membership_hall_worker" ON "UnionMembership"("unionHallId", "workerId");
CREATE INDEX "idx_union_membership_worker_status" ON "UnionMembership"("workerId", "status");
ALTER TABLE "UnionMembership" ADD CONSTRAINT "UnionMembership_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionMembership" ADD CONSTRAINT "UnionMembership_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UnionDispatch" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "dispatchedBy" INTEGER,
    "dispatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recalledAt" TIMESTAMP(3),
    CONSTRAINT "UnionDispatch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_union_dispatch_hall_date" ON "UnionDispatch"("unionHallId", "dispatchedAt");
CREATE INDEX "idx_union_dispatch_worker" ON "UnionDispatch"("workerId");
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_dispatchedBy_fkey" FOREIGN KEY ("dispatchedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Merge audit
CREATE TABLE "WorkerMergeRecord" (
    "id" SERIAL NOT NULL,
    "survivorWorkerId" INTEGER NOT NULL,
    "mergedWorkerId" INTEGER NOT NULL,
    "mergedByUserId" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkerMergeRecord_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "WorkerMergeRecord" ADD CONSTRAINT "WorkerMergeRecord_survivorWorkerId_fkey" FOREIGN KEY ("survivorWorkerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkerMergeRecord" ADD CONSTRAINT "WorkerMergeRecord_mergedWorkerId_fkey" FOREIGN KEY ("mergedWorkerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "EquipmentMergeRecord" (
    "id" SERIAL NOT NULL,
    "survivorEquipmentId" INTEGER NOT NULL,
    "mergedEquipmentId" INTEGER NOT NULL,
    "mergedByUserId" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentMergeRecord_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "EquipmentMergeRecord" ADD CONSTRAINT "EquipmentMergeRecord_survivorEquipmentId_fkey" FOREIGN KEY ("survivorEquipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentMergeRecord" ADD CONSTRAINT "EquipmentMergeRecord_mergedEquipmentId_fkey" FOREIGN KEY ("mergedEquipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User FKs
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill CompanyLink from existing worker.companyId
INSERT INTO "CompanyLink" ("workerId", "companyId", "active", "startDate")
SELECT w."id", w."companyId", true, CURRENT_TIMESTAMP
FROM "Worker" w
WHERE w."companyId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "CompanyLink" cl
    WHERE cl."workerId" = w."id" AND cl."companyId" = w."companyId" AND cl."active" = true
  );

-- Backfill EquipmentLink from existing equipment.companyId
INSERT INTO "EquipmentLink" ("equipmentId", "companyId", "active", "startDate")
SELECT e."id", e."companyId", true, COALESCE(e."createdAt", CURRENT_TIMESTAMP)
FROM "Equipment" e
WHERE e."companyId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "EquipmentLink" el
    WHERE el."equipmentId" = e."id" AND el."companyId" = e."companyId" AND el."active" = true
  );

-- Stable QR tokens for workers/equipment missing them
UPDATE "Worker" SET "qrToken" = 'w-' || "id"::text WHERE "qrToken" IS NULL;
UPDATE "Equipment" SET "qrToken" = 'e-' || "id"::text WHERE "qrToken" IS NULL;
