import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { PushService } from './channels/push.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [NotificationsService, EmailService, SmsService, PushService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
