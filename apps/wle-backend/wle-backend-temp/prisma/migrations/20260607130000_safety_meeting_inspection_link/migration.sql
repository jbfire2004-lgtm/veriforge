-- Link safety meetings to originating PM inspections.
ALTER TABLE "safety_meetings" ADD COLUMN "pmInspectionId" TEXT;

CREATE UNIQUE INDEX "safety_meetings_pmInspectionId_key"
  ON "safety_meetings"("pmInspectionId");

ALTER TABLE "safety_meetings"
  ADD CONSTRAINT "safety_meetings_pmInspectionId_fkey"
  FOREIGN KEY ("pmInspectionId") REFERENCES "pm_inspection"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
