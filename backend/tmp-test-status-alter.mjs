import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const attempts = [
  `ALTER TABLE "Notification" ALTER COLUMN "status" TYPE "NotificationStatus" USING ("status"::"NotificationStatus")`,
  `ALTER TABLE "Notification" ALTER COLUMN "status" TYPE "NotificationStatus" USING (
    CASE
      WHEN "status"::text = 'SENT' THEN 'SENT'::"NotificationStatus"
      ELSE 'PENDING'::"NotificationStatus"
    END
  )`,
];

for (const sql of attempts) {
  try {
    await p.$executeRawUnsafe(sql);
    console.log('OK:', sql.slice(0, 80));
    break;
  } catch (e) {
    console.error('FAIL:', e.message);
  }
}
await p.$disconnect();
