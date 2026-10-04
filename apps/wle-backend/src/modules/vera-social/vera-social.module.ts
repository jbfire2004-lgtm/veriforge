import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialActivityService } from './social-activity.service';
import { SocialNotificationService } from './social-notification.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SocialController],
  providers: [SocialService, SocialActivityService, SocialNotificationService],
  exports: [SocialService, SocialActivityService],
})
export class VeraSocialModule {}
