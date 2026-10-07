ALTER TABLE "jha_flha" ADD COLUMN IF NOT EXISTS "workPackageId" TEXT;
ALTER TABLE "jha_flha" ADD COLUMN IF NOT EXISTS "taskId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "jha_flha_taskId_key" ON "jha_flha"("taskId");
ALTER TABLE "jha_flha" ADD COLUMN IF NOT EXISTS "hecaCategoryKey" TEXT;

CREATE INDEX IF NOT EXISTS "jha_flha_workPackageId_idx" ON "jha_flha"("workPackageId");
CREATE INDEX IF NOT EXISTS "jha_flha_taskId_idx" ON "jha_flha"("taskId");

ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_workPackageId_fkey"
  FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
