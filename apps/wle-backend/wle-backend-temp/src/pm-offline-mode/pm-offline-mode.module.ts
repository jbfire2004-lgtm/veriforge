import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { FieldSyncModule } from '../modules/field-sync/field-sync.module';
import { JhaFlhaModule } from '../jha-flha/jha-flha.module';
import { PmInspectionsModule } from '../pm-inspections/pm-inspections.module';
import { PmSafetyEventsModule } from '../pm-safety-events/pm-safety-events.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmTrainingModule } from '../pm-training/pm-training.module';
import { PmDocumentControlModule } from '../pm-document-control/pm-document-control.module';
import { PmEquipmentSafetyModule } from '../pm-equipment-safety/pm-equipment-safety.module';
import { PmEmergencyResponseModule } from '../pm-emergency-response/pm-emergency-response.module';
import { PmSiteAccessControlModule } from '../pm-site-access-control/pm-site-access-control.module';
import { PmAttachmentsMediaModule } from '../pm-attachments-media/pm-attachments-media.module';
import { PmSafetyStationsModule } from '../pm-safety-stations/pm-safety-stations.module';
import { PmProjectManagementModule } from '../pm-project-management/pm-project-management.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { PmSafetyMeetingsModule } from '../pm-safety-meetings/pm-safety-meetings.module';
import { SafetyFormsModule } from '../forms/safety-forms.module';
import { PmOfflineModeController } from './pm-offline-mode.controller';
import { PmOfflineController } from './pm-offline.controller';
import { PmOfflineModeService } from './pm-offline-mode.service';
import { PmOfflineCailIntelligenceService } from './pm-offline-cail-intelligence.service';
import { OfflineBatchRouter } from './offline-batch.router';
import { PmOfflineSyncWorker } from './pm-offline-sync.worker';

@Module({
  imports: [
    ScheduleModule,
    PrismaModule,
    FieldSyncModule,
    JhaFlhaModule,
    PmInspectionsModule,
    PmSafetyEventsModule,
    PmCorrectiveActionsModule,
    PmTrainingModule,
    PmDocumentControlModule,
    PmEquipmentSafetyModule,
    PmEmergencyResponseModule,
    PmSiteAccessControlModule,
    PmAttachmentsMediaModule,
    PmSafetyStationsModule,
    PmProjectManagementModule,
    SifHecaModule,
    PmSafetyMeetingsModule,
    forwardRef(() => SafetyFormsModule),
  ],
  controllers: [PmOfflineModeController, PmOfflineController],
  providers: [
    PmOfflineModeService,
    PmOfflineCailIntelligenceService,
    OfflineBatchRouter,
    PmOfflineSyncWorker,
  ],
  exports: [PmOfflineModeService, PmOfflineCailIntelligenceService],
})
export class PmOfflineModeModule {}
