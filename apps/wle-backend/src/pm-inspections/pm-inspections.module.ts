import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { VisionModule } from '../modules/vision/vision.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { PmSmsCoreModule } from '../pm-sms-core/pm-sms-core.module';
import { PmSafetyEventsModule } from '../pm-safety-events/pm-safety-events.module';
import { PmSafetyMeetingsModule } from '../pm-safety-meetings/pm-safety-meetings.module';
import { PmInspectionsController } from './pm-inspections.controller';
import { PmInspectionsService } from './pm-inspections.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { InspectionTemplateEngine } from './inspection-template.engine';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import { PmInspectionsCailService } from './pm-inspections-cail.service';
import { PmInspectionsEquipmentService } from './pm-inspections-equipment.service';
import { PmInspectionsIngestionService } from './pm-inspections-ingestion.service';
import { PmInspectionsCailIntelligenceService } from './pm-inspections-cail-intelligence.service';
import { PmInspectionPhotoPipelineService } from './pm-inspection-photo-pipeline.service';
import { PmInspectionFindingCapaService } from './pm-inspection-finding-capa.service';
import { PmInspectionContractorDispatchService } from './pm-inspection-contractor-dispatch.service';
import { PmInspectionDashboardService } from './pm-inspection-dashboard.service';
import { PmInspectionSubcontractorResolverService } from './pm-inspection-subcontractor-resolver.service';
import { PmInspectionV2Scheduler } from './pm-inspection-v2.scheduler';
import { PmInspectionIncidentService } from './pm-inspection-incident.service';
import { PmInspectionMeetingService } from './pm-inspection-meeting.service';
import { PmInspectionAutomationConfigService } from './pm-inspection-automation-config.service';
import { PmInspectionCompletedEventService } from './pm-inspection-completed-event.service';
import { PmInspectionReportService } from './pm-inspection-report.service';
import { PmInspectionAccessService } from './pm-inspection-access.service';
import { PmInspectionFindingsLogService } from './pm-inspection-findings-log.service';
import { PmInspectionSharedService } from './pm-inspection-shared.service';
import { InspectionCatalogController } from './inspection-catalog.controller';
import { InspectionCatalogService } from './inspection-catalog.service';
import { AuditInspectionCapaEngineService } from './audit-inspection-capa-engine.service';
import { PpePreUseController } from './ppe-preuse/ppe-preuse.controller';
import { PpePreUseService } from './ppe-preuse/ppe-preuse.service';

@Module({
  imports: [
    ScheduleModule,
    PrismaModule,
    SafetyIntelligenceModule,
    SifHecaModule,
    forwardRef(() => PmCorrectiveActionsModule),
    forwardRef(() => VeraCoreModule),
    VisionModule,
    NotificationsModule,
    DomainEventBusModule,
    forwardRef(() => PmSmsCoreModule),
    forwardRef(() => PmSafetyEventsModule),
    forwardRef(() => PmSafetyMeetingsModule),
  ],
  controllers: [
    PmInspectionsController,
    InspectionCatalogController,
    PpePreUseController,
  ],
  providers: [
    PmInspectionsService,
    PmInspectionTemplatesService,
    InspectionCatalogService,
    InspectionTemplateEngine,
    InspectionScoringEngine,
    DeficiencyScoringEngine,
    PmInspectionsCailService,
    PmInspectionsEquipmentService,
    PmInspectionsIngestionService,
    PmInspectionsCailIntelligenceService,
    PmInspectionPhotoPipelineService,
    PmInspectionFindingCapaService,
    PmInspectionContractorDispatchService,
    PmInspectionDashboardService,
    PmInspectionSubcontractorResolverService,
    PmInspectionV2Scheduler,
    PmInspectionIncidentService,
    PmInspectionAutomationConfigService,
    PmInspectionMeetingService,
    PmInspectionCompletedEventService,
    PmInspectionReportService,
    PmInspectionAccessService,
    PmInspectionFindingsLogService,
    PmInspectionSharedService,
    AuditInspectionCapaEngineService,
    PpePreUseService,
  ],
  exports: [
    PmInspectionsService,
    PmInspectionTemplatesService,
    InspectionCatalogService,
    PmInspectionsIngestionService,
    PmInspectionPhotoPipelineService,
    PmInspectionDashboardService,
    PmInspectionContractorDispatchService,
    PmInspectionSubcontractorResolverService,
    PmInspectionReportService,
    PmInspectionAccessService,
    PmInspectionFindingsLogService,
    PmInspectionSharedService,
    PpePreUseService,
  ],
})
export class PmInspectionsModule {}
