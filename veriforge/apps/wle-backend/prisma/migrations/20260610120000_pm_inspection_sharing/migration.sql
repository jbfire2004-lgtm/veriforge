-- Report sharing controls for completed site inspection walkdowns
ALTER TABLE "pm_inspection"
  ADD COLUMN IF NOT EXISTS "sharing_json" JSONB NOT NULL
  DEFAULT '{"shareReportWithContractors":false,"shareReportWithWorkers":false}';
