import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CoreUploadModule } from '../modules/core-upload/core-upload.module';
import { VisionModule } from '../modules/vision/vision.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrainingIngestionModule } from '../training-ingestion/training-ingestion.module';
import { CailController } from './cail/cail.controller';
import { CailService } from './cail/cail.service';
import { CailScopeService } from './cail/cail-scope.service';
import { CailEmitterService } from './cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from './cail/cail-copilot-enrichment.service';
import { VsiDashboardsController } from './dashboards/dashboards.controller';
import { VsiDashboardsService } from './dashboards/dashboards.service';
import { SafetyInspectionsController } from './inspections/inspections.controller';
import { SafetyInspectionsService } from './inspections/inspections.service';
import { BboController } from './bbo/bbo.controller';
import { BboService } from './bbo/bbo.service';
import { EquipmentBridgeController } from './equipment-bridge/equipment-bridge.controller';
import { EquipmentBridgeService } from './equipment-bridge/equipment-bridge.service';
import { IncidentsVsiController } from './incidents/incidents-vsi.controller';
import { IncidentsVsiService } from './incidents/incidents-vsi.service';
import { SafetyIntelligenceAiService } from './ai/safety-intelligence-ai.service';
import { FormCailBridgeService } from './forms/form-cail-bridge.service';
import { LessonsLearnedController } from './lessons-learned/lessons-learned.controller';
import { LessonsLearnedService } from './lessons-learned/lessons-learned.service';
import { VsiPresentationsController } from './presentations/presentations.controller';
import { VsiPresentationsService } from './presentations/presentations.service';
import { VsiAttachmentsService } from './attachments/vsi-attachments.service';
import { CailOverdueScheduler } from './scheduler/cail-overdue.scheduler';
import { VsiVisionBridgeService } from './ai/vsi-vision-bridge.service';
import { LlmSafetyService } from './ai/llm-safety.service';
import { CoreActionCailBackfillService } from './migration/core-action-cail-backfill.service';
import { CailMigrationController } from './migration/cail-migration.controller';
import { PredictiveRiskService } from './predictive/predictive-risk.service';
import { PredictiveRiskScheduler } from './scheduler/predictive-risk.scheduler';
import { ProjectSafetyRoleService } from './rbac/project-safety-role.service';
import { ProjectSafetyRoleController } from './rbac/project-safety-role.controller';
import { VsiEventService } from './events/vsi-event.service';
import { VsiDashboardRevisionService } from './events/vsi-dashboard-revision.service';
import { VsiDomainEventHandler } from './events/vsi-domain-event.handler';
import { LessonEmbeddingService } from './lessons-learned/lesson-embedding.service';
import { VsiCopilotEngineService } from './ai/copilot/vsi-copilot-engine.service';
import { VsiCopilotController } from './ai/copilot/vsi-copilot.controller';

@Module({
  imports: [
    ScheduleModule,
    DomainEventBusModule,
    PrismaModule,
    CoreUploadModule,
    VisionModule,
    NotificationsModule,
    TrainingIngestionModule,
  ],
  controllers: [
    CailController,
    VsiDashboardsController,
    SafetyInspectionsController,
    BboController,
    EquipmentBridgeController,
    IncidentsVsiController,
    LessonsLearnedController,
    VsiPresentationsController,
    CailMigrationController,
    ProjectSafetyRoleController,
    VsiCopilotController,
  ],
  providers: [
    LessonsLearnedService,
    CailService,
    CailScopeService,
    CailEmitterService,
    CailCopilotEnrichmentService,
    VsiDashboardsService,
    SafetyInspectionsService,
    BboService,
    EquipmentBridgeService,
    IncidentsVsiService,
    SafetyIntelligenceAiService,
    FormCailBridgeService,
    VsiPresentationsService,
    LessonsLearnedService,
    VsiAttachmentsService,
    CailOverdueScheduler,
    VsiVisionBridgeService,
    LlmSafetyService,
    CoreActionCailBackfillService,
    PredictiveRiskService,
    PredictiveRiskScheduler,
    ProjectSafetyRoleService,
    VsiEventService,
    VsiDashboardRevisionService,
    VsiDomainEventHandler,
    LessonEmbeddingService,
    VsiCopilotEngineService,
  ],
  exports: [
    CailService,
    CailScopeService,
    CailEmitterService,
    CailCopilotEnrichmentService,
    EquipmentBridgeService,
    FormCailBridgeService,
    VsiCopilotEngineService,
    LlmSafetyService,
  ],
})
export class SafetyIntelligenceModule {}
