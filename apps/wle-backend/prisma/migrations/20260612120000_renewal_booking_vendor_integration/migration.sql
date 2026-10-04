-- Renewal Booking Engine + Vendor Integration Layer
-- Scoped migration: only the renewal/vendor enums, tables and indexes.

-- CreateEnum (idempotent)
DO $$ BEGIN
  CREATE TYPE "RenewalRecommendationStatus" AS ENUM ('PENDING', 'NOTIFIED', 'BOOKED', 'DISMISSED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VendorSource" AS ENUM ('CALENDLY', 'THINKIFIC', 'ABSORB', 'REST', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BookingDeliveryMode" AS ENUM ('IN_PERSON', 'VIRTUAL', 'ONLINE_SELF_PACED', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VendorSyncStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PARTIAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "renewal_recommendations" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "certificationId" TEXT NOT NULL,
    "certType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "windowDays" INTEGER NOT NULL,
    "companyId" INTEGER,
    "status" "RenewalRecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "recommendedVendorId" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "renewal_vendor_availability_cache" (
    "id" TEXT NOT NULL,
    "certType" TEXT NOT NULL,
    "source" "VendorSource" NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_vendor_availability_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "booking_records" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "certType" TEXT NOT NULL,
    "certificationId" TEXT,
    "recommendationId" TEXT,
    "vendorId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorSource" "VendorSource" NOT NULL,
    "deliveryMode" "BookingDeliveryMode" NOT NULL,
    "externalRef" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "location" TEXT,
    "companyId" INTEGER,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "renewal_vendor_sync_logs" (
    "id" TEXT NOT NULL,
    "vendorSource" "VendorSource" NOT NULL,
    "certType" TEXT,
    "action" TEXT NOT NULL,
    "status" "VendorSyncStatus" NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "renewal_vendor_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "vendor_availability_cache" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "certType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seatsAvailable" INTEGER NOT NULL,
    "deliveryMode" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "distanceKm" DOUBLE PRECISION,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_availability_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "vendor_sync_logs" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "renewal_recommendations_workerId_status_idx" ON "renewal_recommendations"("workerId", "status");
CREATE INDEX IF NOT EXISTS "renewal_recommendations_expiresAt_idx" ON "renewal_recommendations"("expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "renewal_recommendations_certificationId_windowDays_key" ON "renewal_recommendations"("certificationId", "windowDays");

CREATE INDEX IF NOT EXISTS "renewal_vendor_availability_cache_certType_expiresAt_idx" ON "renewal_vendor_availability_cache"("certType", "expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "renewal_vendor_availability_cache_certType_source_key" ON "renewal_vendor_availability_cache"("certType", "source");

CREATE INDEX IF NOT EXISTS "booking_records_workerId_status_idx" ON "booking_records"("workerId", "status");
CREATE INDEX IF NOT EXISTS "booking_records_recommendationId_idx" ON "booking_records"("recommendationId");
CREATE INDEX IF NOT EXISTS "booking_records_vendorSource_status_idx" ON "booking_records"("vendorSource", "status");

CREATE INDEX IF NOT EXISTS "renewal_vendor_sync_logs_vendorSource_action_createdAt_idx" ON "renewal_vendor_sync_logs"("vendorSource", "action", "createdAt");

CREATE INDEX IF NOT EXISTS "vendor_availability_cache_certType_idx" ON "vendor_availability_cache"("certType");
CREATE INDEX IF NOT EXISTS "vendor_availability_cache_vendorId_idx" ON "vendor_availability_cache"("vendorId");
CREATE INDEX IF NOT EXISTS "vendor_availability_cache_vendorId_certType_idx" ON "vendor_availability_cache"("vendorId", "certType");
CREATE INDEX IF NOT EXISTS "vendor_availability_cache_lastSyncedAt_idx" ON "vendor_availability_cache"("lastSyncedAt");

CREATE INDEX IF NOT EXISTS "vendor_sync_logs_vendorId_createdAt_idx" ON "vendor_sync_logs"("vendorId", "createdAt");
