import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmSafetyEcosystemModule } from '../pm-safety-ecosystem/pm-safety-ecosystem.module';
import { JhaFlhaModule } from '../jha-flha/jha-flha.module';
import { PmInspectionsModule } from '../pm-inspections/pm-inspections.module';
import { PmSafetyEventsModule } from '../pm-safety-events/pm-safety-events.module';
import { PmSmsCoreController } from './pm-sms-core.controller';
import { SmsWorkflowController } from './sms-workflow/sms-workflow.controller';
import { SmsWorkflowService } from './sms-workflow/sms-workflow.service';
import { SmsRiskEscalationEngine } from './sms-risk-escalation.engine';
import { SmsRiskContextService } from './sms-risk-context.service';
import { SmsHecaLibraryService } from './sms-heca-library.service';
import { SmsEnergyWheelService } from './sms-energy-wheel.service';
import { SmsNotificationRouterService } from './sms-notification-router.service';
import { SmsInspectionIntegrationService } from './sms-inspection-integration.service';
import { SmsInvestigationIntegrationService } from './sms-investigation-integration.service';
import { SmsAnalyticsService } from './sms-analytics.service';
import { RcaEngine } from '../pm-safety-events/rca.engine';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    forwardRef(() => PmCorrectiveActionsModule),
    PmSafetyEcosystemModule,
    forwardRef(() => JhaFlhaModule),
    forwardRef(() => PmInspectionsModule),
    forwardRef(() => PmSafetyEventsModule),
  ],
  controllers: [PmSmsCoreController, SmsWorkflowController],
  providers: [
    SmsWorkflowService,
    SmsRiskEscalationEngine,
    SmsRiskContextService,
    SmsHecaLibraryService,
    SmsEnergyWheelService,
    SmsNotificationRouterService,
    SmsInspectionIntegrationService,
    SmsInvestigationIntegrationService,
    SmsAnalyticsService,
    RcaEngine,
  ],
  exports: [
    SmsWorkflowService,
    SmsRiskEscalationEngine,
    SmsRiskContextService,
    SmsHecaLibraryService,
    SmsEnergyWheelService,
    SmsNotificationRouterService,
    SmsInspectionIntegrationService,
    SmsInvestigationIntegrationService,
    SmsAnalyticsService,
  ],
})
export class PmSmsCoreModule {}
