-- Vera Core Orientation Module

CREATE TYPE "OrientationPackageType" AS ENUM ('UPLOAD', 'AI_GENERATED');
CREATE TYPE "OrientationAssignmentScope" AS ENUM ('COMPANY', 'PROJECT', 'ONBOARDING');
CREATE TYPE "OrientationWorkerProgressStatus" AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'REORIENTATION_REQUIRED'
);

CREATE TABLE "orientation_packages" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "company_id" INTEGER REFERENCES "Company"("id") ON DELETE CASCADE,
  "project_id" INTEGER REFERENCES "Project"("id") ON DELETE CASCADE,
  "type" "OrientationPackageType" NOT NULL,
  "title" TEXT NOT NULL,
  "languages" TEXT[] NOT NULL DEFAULT ARRAY['en']::TEXT[],
  "version" INTEGER NOT NULL DEFAULT 1,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "created_by_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "updated_by_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "orientation_packages_scope_xor" CHECK (
    ("company_id" IS NOT NULL AND "project_id" IS NULL) OR
    ("company_id" IS NULL AND "project_id" IS NOT NULL)
  )
);

CREATE INDEX "orientation_packages_company_id_idx" ON "orientation_packages"("company_id");
CREATE INDEX "orientation_packages_project_id_idx" ON "orientation_packages"("project_id");

CREATE TABLE "orientation_versions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "package_id" TEXT NOT NULL REFERENCES "orientation_packages"("id") ON DELETE CASCADE,
  "version_number" INTEGER NOT NULL,
  "sections" JSONB NOT NULL DEFAULT '{}',
  "media" JSONB NOT NULL DEFAULT '[]',
  "quiz" JSONB NOT NULL DEFAULT '{}',
  "ai_metadata" JSONB,
  "created_by_id" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orientation_versions_package_id_version_number_key" UNIQUE ("package_id", "version_number")
);

CREATE TABLE "orientation_assignments" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "package_id" TEXT NOT NULL REFERENCES "orientation_packages"("id") ON DELETE CASCADE,
  "scope" "OrientationAssignmentScope" NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "orientation_assignments_package_id_scope_idx" ON "orientation_assignments"("package_id", "scope");

CREATE TABLE "orientation_worker_progress" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "package_id" TEXT NOT NULL REFERENCES "orientation_packages"("id") ON DELETE CASCADE,
  "worker_id" INTEGER NOT NULL REFERENCES "Worker"("id") ON DELETE CASCADE,
  "version_number" INTEGER NOT NULL,
  "language_code" TEXT NOT NULL DEFAULT 'en',
  "status" "OrientationWorkerProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "quiz_score" DOUBLE PRECISION,
  "certificate_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orientation_worker_progress_package_id_worker_id_key" UNIQUE ("package_id", "worker_id")
);

CREATE INDEX "orientation_worker_progress_worker_id_status_idx" ON "orientation_worker_progress"("worker_id", "status");
