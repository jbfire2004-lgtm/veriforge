-- Link PM safety events (incidents) to originating inspections.
ALTER TABLE "pm_safety_event" ADD COLUMN "pmInspectionId" TEXT;

CREATE UNIQUE INDEX "pm_safety_event_pmInspectionId_key"
  ON "pm_safety_event"("pmInspectionId");

ALTER TABLE "pm_safety_event"
  ADD CONSTRAINT "pm_safety_event_pmInspectionId_fkey"
  FOREIGN KEY ("pmInspectionId") REFERENCES "pm_inspection"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
