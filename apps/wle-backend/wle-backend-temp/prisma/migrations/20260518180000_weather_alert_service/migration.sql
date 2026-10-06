-- CreateEnum
CREATE TYPE "UserLocationSource" AS ENUM ('GPS', 'WORKSITE', 'PRIMARY');

-- AlterTable Site
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Site" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- AlterTable UserHomepagePreferences
ALTER TABLE "UserHomepagePreferences" ADD COLUMN IF NOT EXISTS "weatherNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserHomepagePreferences" ADD COLUMN IF NOT EXISTS "weatherWalletDisplayEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserHomepagePreferences" ADD COLUMN IF NOT EXISTS "primaryLatitude" DOUBLE PRECISION;
ALTER TABLE "UserHomepagePreferences" ADD COLUMN IF NOT EXISTS "primaryLongitude" DOUBLE PRECISION;

-- CreateTable weather_alerts (CAP ingestion)
CREATE TABLE "weather_alerts" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "rawCapXml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable weather_zone_map
CREATE TABLE "weather_zone_map" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "polygon" JSONB NOT NULL,

    CONSTRAINT "weather_zone_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable user_location_history
CREATE TABLE "user_location_history" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "source" "UserLocationSource" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_location_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable weather_alert_deliveries
CREATE TABLE "weather_alert_deliveries" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "alertId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_alert_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weather_alerts_alertId_zoneId_key" ON "weather_alerts"("alertId", "zoneId");
CREATE INDEX "weather_alerts_zoneId_effectiveAt_idx" ON "weather_alerts"("zoneId", "effectiveAt" DESC);
CREATE INDEX "weather_alerts_expiresAt_idx" ON "weather_alerts"("expiresAt");

CREATE UNIQUE INDEX "weather_zone_map_zoneId_key" ON "weather_zone_map"("zoneId");

CREATE INDEX "user_location_history_userId_updatedAt_idx" ON "user_location_history"("userId", "updatedAt" DESC);

CREATE UNIQUE INDEX "weather_alert_deliveries_userId_alertId_key" ON "weather_alert_deliveries"("userId", "alertId");
CREATE INDEX "weather_alert_deliveries_alertId_idx" ON "weather_alert_deliveries"("alertId");

-- AddForeignKey
ALTER TABLE "user_location_history" ADD CONSTRAINT "user_location_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weather_alert_deliveries" ADD CONSTRAINT "weather_alert_deliveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weather_alert_deliveries" ADD CONSTRAINT "weather_alert_deliveries_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "weather_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
