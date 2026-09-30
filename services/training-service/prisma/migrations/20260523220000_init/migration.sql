-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('assigned', 'completed', 'verified', 'expired');

-- CreateTable
CREATE TABLE "training_courses" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT,
    "duration_hours" DOUBLE PRECISION,
    "expiry_days" INTEGER NOT NULL DEFAULT 365,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_matrix" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "required_courses" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_training" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "status" "TrainingStatus" NOT NULL DEFAULT 'assigned',
    "completion_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "competency_level" TEXT NOT NULL DEFAULT 'basic',
    "competency_score" INTEGER NOT NULL DEFAULT 0,
    "certificate_path" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_training_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_courses_company_id_idx" ON "training_courses"("company_id");
CREATE INDEX "training_courses_company_id_category_idx" ON "training_courses"("company_id", "category");
CREATE UNIQUE INDEX "training_matrix_company_id_role_key" ON "training_matrix"("company_id", "role");
CREATE INDEX "training_matrix_company_id_idx" ON "training_matrix"("company_id");
CREATE INDEX "worker_training_worker_id_idx" ON "worker_training"("worker_id");
CREATE INDEX "worker_training_company_id_worker_id_idx" ON "worker_training"("company_id", "worker_id");
CREATE INDEX "worker_training_company_id_course_id_idx" ON "worker_training"("company_id", "course_id");
CREATE INDEX "worker_training_expiry_date_status_idx" ON "worker_training"("expiry_date", "status");

-- AddForeignKey
ALTER TABLE "worker_training" ADD CONSTRAINT "worker_training_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
