import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmInspectionsModule } from '../pm-inspections/pm-inspections.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmContractorPortalController } from './pm-contractor-portal.controller';
import { PmContractorPortalAccessService } from './pm-contractor-portal-access.service';
import { PmContractorPortalInboxService } from './pm-contractor-portal-inbox.service';
import { PmContractorPortalFindingsService } from './pm-contractor-portal-findings.service';
import { PmContractorPortalComplianceService } from './pm-contractor-portal-compliance.service';
import { PmContractorPortalMessagesService } from './pm-contractor-portal-messages.service';
import { ContractorComplianceEngineService } from './contractor-compliance-engine.service';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    PmInspectionsModule,
    PmCorrectiveActionsModule,
  ],
  controllers: [PmContractorPortalController],
  providers: [
    PmContractorPortalAccessService,
    PmContractorPortalInboxService,
    PmContractorPortalFindingsService,
    PmContractorPortalComplianceService,
    PmContractorPortalMessagesService,
    ContractorComplianceEngineService,
  ],
  exports: [PmContractorPortalAccessService, ContractorComplianceEngineService],
})
export class PmContractorPortalModule {}
