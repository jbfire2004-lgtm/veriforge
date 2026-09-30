-- Safety Program Ingestion runs (VeriCore + VeriPM shared engine)

DO $$ BEGIN
  CREATE TYPE "SafetyProgramIngestStatus" AS ENUM (
    'UPLOADED', 'EXTRACTING', 'NEEDS_REVIEW', 'CONFIRMED', 'REJECTED', 'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SafetyProgramIngestChannel" AS ENUM ('core', 'pm', 'api');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "safety_program_ingest_runs" (
  "id" UUID NOT NULL,
  "company_id" INTEGER NOT NULL,
  "project_id" INTEGER,
  "core_file_id" INTEGER,
  "channel" "SafetyProgramIngestChannel" NOT NULL DEFAULT 'api',
  "status" "SafetyProgramIngestStatus" NOT NULL DEFAULT 'UPLOADED',
  "source_file_name" VARCHAR(512),
  "raw_text" TEXT,
  "extract_json" JSONB,
  "confidence" REAL,
  "error" TEXT,
  "confirmed_at" TIMESTAMPTZ(6),
  "confirmed_by" VARCHAR(128),
  "writeback_summary" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "safety_program_ingest_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "safety_program_ingest_runs_company_project_created_idx"
  ON "safety_program_ingest_runs"("company_id", "project_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "safety_program_ingest_runs_status_idx"
  ON "safety_program_ingest_runs"("status");
CREATE INDEX IF NOT EXISTS "safety_program_ingest_runs_core_file_id_idx"
  ON "safety_program_ingest_runs"("core_file_id");
