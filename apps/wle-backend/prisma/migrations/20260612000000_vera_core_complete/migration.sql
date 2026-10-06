-- Vera Core: API keys, wallet bundles, offline sync tables

CREATE TYPE "CoreOfflineSyncStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CONFLICT'
);

CREATE TABLE IF NOT EXISTS "vera_api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "company_id" INTEGER,
    "training_provider_id" INTEGER,
    "scopes" TEXT[] DEFAULT ARRAY['read']::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vera_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vera_api_keys_key_hash_key"
    ON "vera_api_keys"("key_hash");

CREATE INDEX IF NOT EXISTS "vera_api_keys_key_prefix_active_idx"
    ON "vera_api_keys"("key_prefix", "active");

CREATE INDEX IF NOT EXISTS "vera_api_keys_company_id_active_idx"
    ON "vera_api_keys"("company_id", "active");

ALTER TABLE "vera_api_keys"
    ADD CONSTRAINT "vera_api_keys_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vera_api_keys"
    ADD CONSTRAINT "vera_api_keys_training_provider_id_fkey"
    FOREIGN KEY ("training_provider_id") REFERENCES "TrainingProvider"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vera_api_keys"
    ADD CONSTRAINT "vera_api_keys_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "worker_wallet_bundles" (
    "id" TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "bundle_hash" TEXT NOT NULL,
    "qr_payload" TEXT,
    "payload" JSONB NOT NULL,
    "device_id" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_wallet_bundles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_wallet_bundles_worker_id_version_key"
    ON "worker_wallet_bundles"("worker_id", "version");

CREATE INDEX IF NOT EXISTS "worker_wallet_bundles_worker_id_synced_at_idx"
    ON "worker_wallet_bundles"("worker_id", "synced_at");

ALTER TABLE "worker_wallet_bundles"
    ADD CONSTRAINT "worker_wallet_bundles_worker_id_fkey"
    FOREIGN KEY ("worker_id") REFERENCES "Worker"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "worker_wallet_bundles"
    ADD CONSTRAINT "worker_wallet_bundles_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "Company"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "core_offline_sync_batches" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "worker_id" INTEGER,
    "company_id" INTEGER,
    "module_type" TEXT NOT NULL,
    "status" "CoreOfflineSyncStatus" NOT NULL DEFAULT 'PENDING',
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "submitted_by_id" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "core_offline_sync_batches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "core_offline_sync_batches_device_id_status_idx"
    ON "core_offline_sync_batches"("device_id", "status");

CREATE INDEX IF NOT EXISTS "core_offline_sync_batches_company_module_submitted_idx"
    ON "core_offline_sync_batches"("company_id", "module_type", "submitted_at");

ALTER TABLE "core_offline_sync_batches"
    ADD CONSTRAINT "core_offline_sync_batches_worker_id_fkey"
    FOREIGN KEY ("worker_id") REFERENCES "Worker"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "core_offline_sync_batches"
    ADD CONSTRAINT "core_offline_sync_batches_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "Company"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "core_offline_sync_batches"
    ADD CONSTRAINT "core_offline_sync_batches_submitted_by_id_fkey"
    FOREIGN KEY ("submitted_by_id") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "core_offline_sync_conflicts" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "module_type" TEXT NOT NULL,
    "record_key" TEXT NOT NULL,
    "local_value" JSONB NOT NULL DEFAULT '{}',
    "server_value" JSONB NOT NULL DEFAULT '{}',
    "resolved_value" JSONB,
    "resolved_by_id" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_offline_sync_conflicts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "core_offline_sync_conflicts_device_id_resolved_at_idx"
    ON "core_offline_sync_conflicts"("device_id", "resolved_at");

CREATE INDEX IF NOT EXISTS "core_offline_sync_conflicts_module_type_record_key_idx"
    ON "core_offline_sync_conflicts"("module_type", "record_key");

ALTER TABLE "core_offline_sync_conflicts"
    ADD CONSTRAINT "core_offline_sync_conflicts_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "core_offline_sync_batches"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "core_offline_sync_conflicts"
    ADD CONSTRAINT "core_offline_sync_conflicts_resolved_by_id_fkey"
    FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
