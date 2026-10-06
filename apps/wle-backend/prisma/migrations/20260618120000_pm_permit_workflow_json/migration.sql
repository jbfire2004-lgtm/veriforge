-- Add workflow payload storage for PM permits (job scope, hazards, controls, signoffs).
ALTER TABLE "permits" ADD COLUMN IF NOT EXISTS "workflowJson" JSONB NOT NULL DEFAULT '{}';
