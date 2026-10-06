-- Hot-path list/filter by tenant + recency for equipment inspections dashboard.
CREATE INDEX IF NOT EXISTS "equipment_inspections_companyId_createdAt_idx"
  ON "equipment_inspections"("companyId", "createdAt");
