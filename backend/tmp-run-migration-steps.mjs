import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const steps = [
  `CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH')`,
  `CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ')`,
  `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "title" TEXT`,
  `ALTER TABLE "Notification" ALTER COLUMN "channel" DROP DEFAULT`,
  `ALTER TABLE "Notification" ALTER COLUMN "channel" TYPE "NotificationChannel" USING (
    CASE UPPER(COALESCE("channel"::text, 'IN_APP'))
      WHEN 'EMAIL' THEN 'EMAIL'::"NotificationChannel"
      WHEN 'SMS' THEN 'SMS'::"NotificationChannel"
      WHEN 'PUSH' THEN 'PUSH'::"NotificationChannel"
      ELSE 'IN_APP'::"NotificationChannel"
    END
  )`,
  `ALTER TABLE "Notification" ALTER COLUMN "channel" SET DEFAULT 'IN_APP'::"NotificationChannel"`,
  `ALTER TABLE "Notification" ALTER COLUMN "status" DROP DEFAULT`,
  `ALTER TABLE "Notification" ALTER COLUMN "status" TYPE "NotificationStatus" USING (
    CASE UPPER(COALESCE("status"::text, 'PENDING'))
      WHEN 'READ' THEN 'READ'::"NotificationStatus"
      WHEN 'FAILED' THEN 'FAILED'::"NotificationStatus"
      WHEN 'SENT' THEN 'SENT'::"NotificationStatus"
      ELSE 'PENDING'::"NotificationStatus"
    END
  )`,
];

for (let i = 0; i < steps.length; i++) {
  const sql = steps[i];
  try {
    await p.$executeRawUnsafe(sql);
    console.log(`OK step ${i + 1}`);
  } catch (e) {
    console.error(`FAIL step ${i + 1}:`, e.message);
    break;
  }
}
await p.$disconnect();
