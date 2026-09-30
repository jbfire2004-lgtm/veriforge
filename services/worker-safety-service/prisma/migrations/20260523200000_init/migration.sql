-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "trade" TEXT,
    "medical_restrictions" JSONB NOT NULL DEFAULT '[]',
    "safety_score" INTEGER NOT NULL DEFAULT 0,
    "risk_level" TEXT NOT NULL DEFAULT 'low',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_training" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "course_id" TEXT NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "competency_level" TEXT NOT NULL DEFAULT 'basic',
    "certificate_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_competencies" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "competency_code" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'basic',
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_authorizations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "authorization_type" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_restrictions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "restriction_type" TEXT NOT NULL,
    "description" TEXT,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_hazard_exposure" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "hazard_id" UUID NOT NULL,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "exposure_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_hazard_exposure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_incidents" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'involved',
    "incident_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_corrective_assignments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "corrective_action_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_corrective_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_access_logs" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "site_id" UUID,
    "access_type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_worker_id_key" ON "worker_profiles"("worker_id");
CREATE INDEX "worker_profiles_company_id_idx" ON "worker_profiles"("company_id");
CREATE INDEX "worker_profiles_company_id_worker_id_idx" ON "worker_profiles"("company_id", "worker_id");
CREATE INDEX "worker_training_worker_id_idx" ON "worker_training"("worker_id");
CREATE INDEX "worker_training_company_id_worker_id_idx" ON "worker_training"("company_id", "worker_id");
CREATE UNIQUE INDEX "worker_competencies_worker_id_competency_code_key" ON "worker_competencies"("worker_id", "competency_code");
CREATE INDEX "worker_competencies_company_id_worker_id_idx" ON "worker_competencies"("company_id", "worker_id");
CREATE INDEX "worker_authorizations_worker_id_idx" ON "worker_authorizations"("worker_id");
CREATE INDEX "worker_authorizations_company_id_worker_id_idx" ON "worker_authorizations"("company_id", "worker_id");
CREATE INDEX "worker_restrictions_worker_id_idx" ON "worker_restrictions"("worker_id");
CREATE INDEX "worker_restrictions_company_id_worker_id_idx" ON "worker_restrictions"("company_id", "worker_id");
CREATE INDEX "worker_hazard_exposure_worker_id_idx" ON "worker_hazard_exposure"("worker_id");
CREATE INDEX "worker_hazard_exposure_company_id_worker_id_idx" ON "worker_hazard_exposure"("company_id", "worker_id");
CREATE INDEX "worker_incidents_worker_id_idx" ON "worker_incidents"("worker_id");
CREATE INDEX "worker_incidents_company_id_worker_id_idx" ON "worker_incidents"("company_id", "worker_id");
CREATE INDEX "worker_corrective_assignments_worker_id_idx" ON "worker_corrective_assignments"("worker_id");
CREATE INDEX "worker_corrective_assignments_company_id_worker_id_idx" ON "worker_corrective_assignments"("company_id", "worker_id");
CREATE INDEX "worker_access_logs_worker_id_idx" ON "worker_access_logs"("worker_id");
CREATE INDEX "worker_access_logs_company_id_worker_id_idx" ON "worker_access_logs"("company_id", "worker_id");
