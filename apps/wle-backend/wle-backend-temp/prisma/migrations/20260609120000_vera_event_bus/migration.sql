CREATE TYPE "EventOutboxStatus" AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'DLQ');

CREATE TABLE IF NOT EXISTS "event_outbox" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "natsSubject" TEXT NOT NULL,
    "partitionKey" TEXT,
    "payload" JSONB NOT NULL,
    "status" "EventOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "event_outbox_idempotencyKey_key"
    ON "event_outbox"("idempotencyKey");

CREATE INDEX IF NOT EXISTS "event_outbox_status_nextRetryAt_createdAt_idx"
    ON "event_outbox"("status", "nextRetryAt", "createdAt");

CREATE INDEX IF NOT EXISTS "event_outbox_eventName_createdAt_idx"
    ON "event_outbox"("eventName", "createdAt");

CREATE TABLE IF NOT EXISTS "event_dead_letter" (
    "id" TEXT NOT NULL,
    "outboxId" TEXT,
    "eventName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumerGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_dead_letter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "event_dead_letter_eventName_createdAt_idx"
    ON "event_dead_letter"("eventName", "createdAt");

ALTER TABLE "event_dead_letter"
    ADD CONSTRAINT "event_dead_letter_outboxId_fkey"
    FOREIGN KEY ("outboxId") REFERENCES "event_outbox"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
