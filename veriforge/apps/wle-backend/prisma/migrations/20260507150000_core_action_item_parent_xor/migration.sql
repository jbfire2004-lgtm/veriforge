-- Enforce CoreActionItem parent linkage invariant at DB layer:
-- either linked to a meeting record OR a daily log OR neither, but never both.
--
-- Added as NOT VALID to avoid breaking deploys when historical data may violate
-- the rule. New/updated rows are still checked by PostgreSQL.

ALTER TABLE "CoreActionItem"
ADD CONSTRAINT "core_action_item_parent_xor_chk"
CHECK (
  NOT (
    "coreMeetingRecordId" IS NOT NULL
    AND "coreDailyLogId" IS NOT NULL
  )
) NOT VALID;

