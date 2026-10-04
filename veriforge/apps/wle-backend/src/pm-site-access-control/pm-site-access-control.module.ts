import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { PmInspectionsModule } from '../pm-inspections/pm-inspections.module';
import { PmSafetyEventsModule } from '../pm-safety-events/pm-safety-events.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmDocumentControlModule } from '../pm-document-control/pm-document-control.module';
import { PmEquipmentSafetyModule } from '../pm-equipment-safety/pm-equipment-safety.module';
import { PmEmergencyResponseModule } from '../pm-emergency-response/pm-emergency-response.module';
import { PmProjectSafetyContextModule } from '../pm-project-safety-context/pm-project-safety-context.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { PmSiteAccessControlController } from './pm-site-access-control.controller';
import { PmAccessController } from './pm-access.controller';
import { PmSiteAccessControlService } from './pm-site-access-control.service';
import { PmSiteAccessCailIntelligenceService } from './pm-site-access-cail-intelligence.service';

@Module({
  imports: [
    PrismaModule,
    SifHecaModule,
    forwardRef(() => PmInspectionsModule),
    forwardRef(() => PmSafetyEventsModule),
    PmCorrectiveActionsModule,
    PmDocumentControlModule,
    PmEquipmentSafetyModule,
    PmEmergencyResponseModule,
    PmProjectSafetyContextModule,
    PmCompanySafetyContextModule,
  ],
  controllers: [PmSiteAccessControlController, PmAccessController],
  providers: [PmSiteAccessControlService, PmSiteAccessCailIntelligenceService],
  exports: [PmSiteAccessControlService, PmSiteAccessCailIntelligenceService],
})
export class PmSiteAccessControlModule {}
