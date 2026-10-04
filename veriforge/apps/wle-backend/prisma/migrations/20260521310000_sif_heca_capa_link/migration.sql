ALTER TABLE "sif_heca_corrective_action" ADD COLUMN IF NOT EXISTS "correctiveActionId" TEXT;

CREATE INDEX IF NOT EXISTS "sif_heca_corrective_action_correctiveActionId_idx"
  ON "sif_heca_corrective_action"("correctiveActionId");
