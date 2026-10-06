import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { VeraExpertQaModule } from '../vera-expert-qa/vera-expert-qa.module';
import { ModerationController } from './moderation.controller';
import { ModerationAdminController } from './moderation-admin.controller';
import { ModerationReportService } from './moderation-report.service';
import { ModerationQueueService } from './moderation-queue.service';
import { ModerationAutoRulesService } from './moderation-auto-rules.service';
import { ModerationResolutionService } from './moderation-resolution.service';
import { ExpertVerificationService } from './expert-verification.service';
import { ModerationNotificationService } from './moderation-notification.service';
import { SocialPostModerationService } from './social-post-moderation.service';

@Module({
  imports: [PrismaModule, NotificationsModule, VeraExpertQaModule],
  controllers: [ModerationController, ModerationAdminController],
  providers: [
    ModerationReportService,
    ModerationQueueService,
    ModerationAutoRulesService,
    ModerationResolutionService,
    ExpertVerificationService,
    ModerationNotificationService,
    SocialPostModerationService,
  ],
  exports: [ModerationReportService, ModerationQueueService],
})
export class VeraModerationModule {}
