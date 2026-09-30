-- CreateTable
CREATE TABLE "config_namespaces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_namespaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_entries" (
    "id" UUID NOT NULL,
    "namespace_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "company_id" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_namespaces_name_key" ON "config_namespaces"("name");

-- CreateIndex
CREATE INDEX "config_entries_namespace_id_key_idx" ON "config_entries"("namespace_id", "key");

-- CreateIndex
CREATE INDEX "config_entries_namespace_id_company_id_idx" ON "config_entries"("namespace_id", "company_id");

-- CreateIndex
CREATE INDEX "config_entries_deleted_at_idx" ON "config_entries"("deleted_at");

-- Active entries: one row per namespace + key + scope (global vs company)
CREATE UNIQUE INDEX "config_entries_active_scope_unique" ON "config_entries" (
    "namespace_id",
    "key",
    (COALESCE("company_id", '00000000-0000-0000-0000-000000000000'::uuid))
) WHERE "deleted_at" IS NULL;

-- AddForeignKey
ALTER TABLE "config_entries" ADD CONSTRAINT "config_entries_namespace_id_fkey" FOREIGN KEY ("namespace_id") REFERENCES "config_namespaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
