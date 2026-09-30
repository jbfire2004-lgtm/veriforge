-- CreateTable
CREATE TABLE "hazards" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "hazard_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "energy_type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "heca_category" TEXT NOT NULL,
    "required_controls" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hazards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controls" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "control_type" TEXT NOT NULL,
    "hierarchy_level" INTEGER NOT NULL,
    "control_strength" INTEGER NOT NULL,
    "verification_steps" JSONB NOT NULL DEFAULT '[]',
    "required_training" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_controls" (
    "id" UUID NOT NULL,
    "hazard_id" UUID NOT NULL,
    "control_id" UUID NOT NULL,

    CONSTRAINT "hazard_controls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hazards_company_id_idx" ON "hazards"("company_id");
CREATE INDEX "hazards_company_id_hazard_type_idx" ON "hazards"("company_id", "hazard_type");
CREATE INDEX "hazards_company_id_sif_potential_idx" ON "hazards"("company_id", "sif_potential");
CREATE INDEX "controls_company_id_idx" ON "controls"("company_id");
CREATE INDEX "controls_company_id_control_type_idx" ON "controls"("company_id", "control_type");
CREATE UNIQUE INDEX "hazard_controls_hazard_id_control_id_key" ON "hazard_controls"("hazard_id", "control_id");
CREATE INDEX "hazard_controls_hazard_id_idx" ON "hazard_controls"("hazard_id");
CREATE INDEX "hazard_controls_control_id_idx" ON "hazard_controls"("control_id");

-- AddForeignKey
ALTER TABLE "hazard_controls" ADD CONSTRAINT "hazard_controls_hazard_id_fkey" FOREIGN KEY ("hazard_id") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hazard_controls" ADD CONSTRAINT "hazard_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
