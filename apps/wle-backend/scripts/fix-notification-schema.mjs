import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const statements = [
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "title" TEXT`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "body" TEXT`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3)`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "scheduledFor" TIMESTAMP(3)`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "notification_dedupe_key" ON "Notification"("dedupeKey")`,
  `CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "Notification"("userId", "readAt")`,
  `CREATE TABLE IF NOT EXISTS "UserNotificationPreference" (
    "userId" INT NOT NULL PRIMARY KEY,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inspectionDue" BOOLEAN NOT NULL DEFAULT true,
    "competencyExpiry" BOOLEAN NOT NULL DEFAULT true,
    "ppeExpiry" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceDue" BOOLEAN NOT NULL DEFAULT true,
    "calibrationDue" BOOLEAN NOT NULL DEFAULT true,
    "assignmentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "phone" TEXT
  )`,
];

for (const sql of statements) {
  await p.$executeRawUnsafe(sql);
  console.log('OK', sql.slice(0, 60));
}

const cols = await p.$queryRaw`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Notification' AND column_name = 'readAt'
`;
console.log('readAt column', cols);
await p.$disconnect();
