-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_id" UUID NOT NULL,
    "event_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_company_id_created_at_idx" ON "audit_events"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_company_id_event_type_idx" ON "audit_events"("company_id", "event_type");

-- CreateIndex
CREATE INDEX "audit_events_company_id_module_idx" ON "audit_events"("company_id", "module");

-- CreateIndex
CREATE INDEX "audit_events_actor_id_idx" ON "audit_events"("actor_id");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");
