-- VISI corrective actions must not collide with PM CAPA table "corrective_actions".
-- No-op when the VISI dual-dashboard enum has not been applied yet.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VisiDataPlane') THEN
    CREATE TABLE IF NOT EXISTS "visi_corrective_actions" (
      "id" TEXT NOT NULL,
      "entity_type" "VisiDataPlane" NOT NULL,
      "token" TEXT NOT NULL,
      "period" TEXT NOT NULL,
      "on_time_rate" DOUBLE PRECISION,
      "open_avg" DOUBLE PRECISION,
      "overdue_count_avg" DOUBLE PRECISION,
      "aging" JSONB NOT NULL DEFAULT '{}',
      "normalized_at" TIMESTAMP(3) NOT NULL,
      "normalizer_version" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "visi_corrective_actions_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "visi_corrective_actions_entity_type_token_period_key"
      ON "visi_corrective_actions"("entity_type", "token", "period");

    CREATE INDEX IF NOT EXISTS "visi_corrective_actions_entity_type_period_idx"
      ON "visi_corrective_actions"("entity_type", "period");

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'visi_corrective_actions_token_fkey'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'anonymized_tokens'
    ) THEN
      ALTER TABLE "visi_corrective_actions"
        ADD CONSTRAINT "visi_corrective_actions_token_fkey"
        FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
