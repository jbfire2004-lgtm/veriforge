-- Admin subscription map: seats, modules, renewal on tenant subscriptions; industry on companies

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "industry" TEXT;

ALTER TABLE "acp_tenant_subscriptions"
  ADD COLUMN IF NOT EXISTS "seats_purchased" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "modules_enabled" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "renewal_date" TIMESTAMP(3);

-- Backfill renewal from ends_at where present
UPDATE "acp_tenant_subscriptions"
SET "renewal_date" = "ends_at"
WHERE "renewal_date" IS NULL AND "ends_at" IS NOT NULL;
