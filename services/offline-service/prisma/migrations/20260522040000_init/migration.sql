-- CreateEnum
CREATE TYPE "OfflineSyncStatus" AS ENUM ('pending_sync', 'syncing', 'synced', 'conflict', 'resolved', 'failed');

-- CreateTable
CREATE TABLE "offline_devices" (
    "device_id" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_sync_at" TIMESTAMP(3),

    CONSTRAINT "offline_devices_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "offline_cache" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "module_type" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "last_modified" TIMESTAMP(3) NOT NULL,
    "sync_status" "OfflineSyncStatus" NOT NULL,
    "client_version" INTEGER,
    "error_message" TEXT,

    CONSTRAINT "offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_conflicts" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "record_id" TEXT NOT NULL,
    "module_type" TEXT NOT NULL,
    "local_value" JSONB NOT NULL,
    "server_value" JSONB NOT NULL,
    "resolved_value" JSONB,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_audit" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "company_id" UUID,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offline_devices_company_id_idx" ON "offline_devices"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "offline_cache_device_id_module_type_record_id_key" ON "offline_cache"("device_id", "module_type", "record_id");

-- CreateIndex
CREATE INDEX "offline_cache_device_id_sync_status_idx" ON "offline_cache"("device_id", "sync_status");

-- CreateIndex
CREATE INDEX "offline_cache_company_id_last_modified_idx" ON "offline_cache"("company_id", "last_modified" DESC);

-- CreateIndex
CREATE INDEX "offline_conflicts_device_id_resolved_at_idx" ON "offline_conflicts"("device_id", "resolved_at");

-- CreateIndex
CREATE INDEX "offline_conflicts_company_id_module_type_idx" ON "offline_conflicts"("company_id", "module_type");

-- CreateIndex
CREATE INDEX "offline_audit_device_id_timestamp_idx" ON "offline_audit"("device_id", "timestamp" DESC);
