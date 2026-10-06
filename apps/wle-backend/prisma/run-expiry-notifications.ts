import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NotificationSchedulerService } from '../src/modules/notification-engine/notification-scheduler.service';

async function main() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  await app.listen(0);

  try {
    const scheduler = app.get(NotificationSchedulerService);
    const training = await scheduler.runTrainingExpiry();
    const equipmentCerts = await scheduler.runEquipmentCertExpiry();
    console.log(JSON.stringify({ training, equipmentCerts }, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
