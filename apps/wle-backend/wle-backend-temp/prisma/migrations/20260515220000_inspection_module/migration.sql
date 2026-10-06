-- Inspection module: types, checklists, extended inspection fields

CREATE TYPE "InspectionType" AS ENUM (
  'PRE_USE',
  'SCHEDULED',
  'PME',
  'CRANE_LIFT',
  'LIFTING_GEAR',
  'VEHICLE',
  'TOOL',
  'HYDRAULIC_PNEUMATIC'
);

CREATE TYPE "InspectionChecklistCategory" AS ENUM (
  'MOBILE_EQUIPMENT',
  'LIFTING_GEAR',
  'VEHICLE',
  'TOOL',
  'PME',
  'CRANE',
  'GENERAL'
);

CREATE TABLE "InspectionChecklist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InspectionChecklistCategory" NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "items" JSONB NOT NULL,
    "intervalDays" INTEGER,
    "intervalHours" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InspectionChecklist_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InspectionChecklist_inspectionType_active_idx" ON "InspectionChecklist"("inspectionType", "active");
CREATE INDEX "InspectionChecklist_category_active_idx" ON "InspectionChecklist"("category", "active");

ALTER TABLE "Inspection" ADD COLUMN "checklistId" INTEGER,
ADD COLUMN "inspectionType" "InspectionType" NOT NULL DEFAULT 'PRE_USE',
ADD COLUMN "photos" JSONB,
ADD COLUMN "correctiveActions" TEXT,
ADD COLUMN "lockoutTriggered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "nextInspectionDate" TIMESTAMP(3);

CREATE INDEX "Inspection_equipmentId_inspectionType_completedAt_idx" ON "Inspection"("equipmentId", "inspectionType", "completedAt");
CREATE INDEX "Inspection_nextInspectionDate_idx" ON "Inspection"("nextInspectionDate");
CREATE INDEX "Inspection_passed_lockoutTriggered_idx" ON "Inspection"("passed", "lockoutTriggered");

ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "InspectionChecklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Map legacy kind to inspectionType
UPDATE "Inspection" SET "inspectionType" = 'SCHEDULED' WHERE "kind" = 'FORMAL' AND "inspectionType" = 'PRE_USE';
UPDATE "Inspection" SET "inspectionType" = 'PRE_USE' WHERE "kind" = 'PRE_USE';

-- Seed default checklists
INSERT INTO "InspectionChecklist" ("name", "category", "inspectionType", "items", "intervalDays", "intervalHours") VALUES
(
  'Pre-use — mobile equipment',
  'MOBILE_EQUIPMENT',
  'PRE_USE',
  '[{"id":"visual","label":"Visual walk-around — leaks, damage","required":true},{"id":"controls","label":"Controls and gauges operational","required":true},{"id":"brakes","label":"Brakes / steering responsive","required":true},{"id":"safety","label":"ROPS, seat belt, horn functional","required":true}]'::jsonb,
  NULL,
  NULL
),
(
  'Scheduled — mobile equipment',
  'MOBILE_EQUIPMENT',
  'SCHEDULED',
  '[{"id":"fluids","label":"Fluid levels within spec","required":true},{"id":"filters","label":"Filters inspected / serviced","required":true},{"id":"undercarriage","label":"Tracks / tires condition acceptable","required":true},{"id":"documentation","label":"Log book / hours recorded","required":true}]'::jsonb,
  7,
  NULL
),
(
  'PME — hours-based',
  'PME',
  'PME',
  '[{"id":"engine","label":"Engine / power unit inspection","required":true},{"id":"hydraulic","label":"Hydraulic hoses and fittings","required":true},{"id":"guards","label":"Guards and shields in place","required":true}]'::jsonb,
  NULL,
  250
),
(
  'Crane / lift inspection',
  'CRANE',
  'CRANE_LIFT',
  '[{"id":"wire","label":"Wire rope / chain condition","required":true},{"id":"hook","label":"Hook, latch, swivel","required":true},{"id":"outriggers","label":"Outriggers / stabilizers","required":true},{"id":"load","label":"Load chart visible / legible","required":true}]'::jsonb,
  30,
  NULL
),
(
  'Lifting gear / rigging',
  'LIFTING_GEAR',
  'LIFTING_GEAR',
  '[{"id":"tag","label":"Identification tag legible","required":true},{"id":"wear","label":"No cuts, kinks, distortion","required":true},{"id":"hardware","label":"Shackles, hooks, rings acceptable","required":true}]'::jsonb,
  90,
  NULL
),
(
  'Vehicle pre-trip',
  'VEHICLE',
  'VEHICLE',
  '[{"id":"tires","label":"Tires, lights, mirrors","required":true},{"id":"brakes","label":"Brakes and steering","required":true},{"id":"fluids","label":"Fluids — no leaks","required":true},{"id":"docs","label":"Registration / insurance current","required":true}]'::jsonb,
  1,
  NULL
),
(
  'Hand tool quarterly',
  'TOOL',
  'TOOL',
  '[{"id":"handle","label":"Handle secure, no cracks","required":true},{"id":"head","label":"Head / jaws condition","required":true},{"id":"insulate","label":"Insulated tools — grip intact (if applicable)","required":false}]'::jsonb,
  90,
  NULL
);
