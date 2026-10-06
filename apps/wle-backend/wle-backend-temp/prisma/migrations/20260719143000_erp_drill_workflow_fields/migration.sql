-- ERP drill live workflow fields (checklist, timeline, issues, summary)
ALTER TABLE "sms_erp_drill_sessions" ADD COLUMN IF NOT EXISTS "drill_type" TEXT;
ALTER TABLE "sms_erp_drill_sessions" ADD COLUMN IF NOT EXISTS "checklist_json" JSONB;
ALTER TABLE "sms_erp_drill_sessions" ADD COLUMN IF NOT EXISTS "timeline_json" JSONB;
ALTER TABLE "sms_erp_drill_sessions" ADD COLUMN IF NOT EXISTS "issues_json" JSONB;
ALTER TABLE "sms_erp_drill_sessions" ADD COLUMN IF NOT EXISTS "summary_json" JSONB;
