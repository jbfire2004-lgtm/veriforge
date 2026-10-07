INSERT INTO "ModerationAutoRule" ("id", "name", "enabled", "targetType", "ruleType", "config", "priority", "action", "updatedAt")
VALUES
  ('rule-reputation-floor', 'Low reputation author flag', true, NULL, 'REPUTATION_FLOOR', '{"minReputation":50}', 15, 'FLAG', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
