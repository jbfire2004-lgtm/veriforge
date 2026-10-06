import { Module } from '@nestjs/common';
import { AcpModule } from '../acp/acp.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmUnifiedCorrectiveActionModule } from '../pm-unified-corrective-action/pm-unified-corrective-action.module';
import { PmSafetyHubController } from './pm-safety-hub.controller';
import { PmSafetyHubDashboardService } from './pm-safety-hub-dashboard.service';
import { PmSafetyHubEvidenceService } from './pm-safety-hub-evidence.service';
import { PmSafetyHubAnalyticsService } from './pm-safety-hub-analytics.service';
import { PmSafetyHubNotificationsService } from './pm-safety-hub-notifications.service';
import { PmSafetyHubEventHandler } from './pm-safety-hub-event.handler';

@Module({
  imports: [
    AcpModule,
    PrismaModule,
    NotificationsModule,
    PmUnifiedCorrectiveActionModule,
  ],
  controllers: [PmSafetyHubController],
  providers: [
    PmSafetyHubDashboardService,
    PmSafetyHubEvidenceService,
    PmSafetyHubAnalyticsService,
    PmSafetyHubNotificationsService,
    PmSafetyHubEventHandler,
  ],
  exports: [PmSafetyHubDashboardService, PmSafetyHubEvidenceService],
})
export class PmSafetyHubModule {}
