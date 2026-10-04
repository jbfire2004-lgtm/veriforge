import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { PmInspectionsModule } from '../pm-inspections/pm-inspections.module';
import { PmSafetyEventsModule } from '../pm-safety-events/pm-safety-events.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmDocumentControlModule } from '../pm-document-control/pm-document-control.module';
import { PmEquipmentSafetyModule } from '../pm-equipment-safety/pm-equipment-safety.module';
import { PmEmergencyResponseModule } from '../pm-emergency-response/pm-emergency-response.module';
import { PmSiteAccessControlModule } from '../pm-site-access-control/pm-site-access-control.module';
import { PmSafetyStationsModule } from '../pm-safety-stations/pm-safety-stations.module';
import { PmProjectSafetyContextModule } from '../pm-project-safety-context/pm-project-safety-context.module';
import { PmWorkerSafetyProfileModule } from '../pm-worker-safety-profile/pm-worker-safety-profile.module';
import { SiteAccessController } from './site-access/site-access.controller';
import { SiteAccessService } from './site-access/site-access.service';
import { SdsController } from './sds/sds.controller';
import { SdsService } from './sds/sds.service';
import { EmergencyController } from './emergency/emergency.controller';
import { EmergencyService } from './emergency/emergency.service';
import { SafetyContextController } from './context/safety-context.controller';
import { ProjectSafetyContextService } from './context/project-safety-context.service';
import { WorkerSafetyProfileService } from './context/worker-safety-profile.service';
import { StationHeartbeatController } from './stations/station-heartbeat.controller';
import { StationHeartbeatService } from './stations/station-heartbeat.service';

@Module({
  imports: [
    PrismaModule,
    SifHecaModule,
    PmInspectionsModule,
    PmSafetyEventsModule,
    PmCorrectiveActionsModule,
    PmDocumentControlModule,
    PmEquipmentSafetyModule,
    PmEmergencyResponseModule,
    PmSiteAccessControlModule,
    PmSafetyStationsModule,
    PmProjectSafetyContextModule,
    PmWorkerSafetyProfileModule,
  ],
  controllers: [
    SiteAccessController,
    SdsController,
    EmergencyController,
    SafetyContextController,
    StationHeartbeatController,
  ],
  providers: [
    SiteAccessService,
    SdsService,
    EmergencyService,
    ProjectSafetyContextService,
    WorkerSafetyProfileService,
    StationHeartbeatService,
  ],
  exports: [
    SiteAccessService,
    ProjectSafetyContextService,
    WorkerSafetyProfileService,
    EmergencyService,
  ],
})
export class SafetyManagementModule {}
