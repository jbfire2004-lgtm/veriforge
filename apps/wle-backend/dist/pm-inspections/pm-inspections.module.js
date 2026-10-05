"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmInspectionsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("../prisma/prisma.module");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const sif_heca_module_1 = require("../sif-heca/sif-heca.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const vera_core_module_1 = require("../modules/vera-core/vera-core.module");
const vision_module_1 = require("../modules/vision/vision.module");
const notifications_module_1 = require("../notifications/notifications.module");
const domain_event_bus_module_1 = require("../modules/api-platform/events/domain-event-bus.module");
const pm_sms_core_module_1 = require("../pm-sms-core/pm-sms-core.module");
const pm_safety_events_module_1 = require("../pm-safety-events/pm-safety-events.module");
const pm_safety_meetings_module_1 = require("../pm-safety-meetings/pm-safety-meetings.module");
const pm_inspections_controller_1 = require("./pm-inspections.controller");
const pm_inspections_service_1 = require("./pm-inspections.service");
const pm_inspection_templates_service_1 = require("./pm-inspection-templates.service");
const inspection_template_engine_1 = require("./inspection-template.engine");
const inspection_scoring_engine_1 = require("./inspection-scoring.engine");
const deficiency_scoring_engine_1 = require("./deficiency-scoring.engine");
const pm_inspections_cail_service_1 = require("./pm-inspections-cail.service");
const pm_inspections_equipment_service_1 = require("./pm-inspections-equipment.service");
const pm_inspections_ingestion_service_1 = require("./pm-inspections-ingestion.service");
const pm_inspections_cail_intelligence_service_1 = require("./pm-inspections-cail-intelligence.service");
const pm_inspection_photo_pipeline_service_1 = require("./pm-inspection-photo-pipeline.service");
const pm_inspection_finding_capa_service_1 = require("./pm-inspection-finding-capa.service");
const pm_inspection_contractor_dispatch_service_1 = require("./pm-inspection-contractor-dispatch.service");
const pm_inspection_dashboard_service_1 = require("./pm-inspection-dashboard.service");
const pm_inspection_subcontractor_resolver_service_1 = require("./pm-inspection-subcontractor-resolver.service");
const pm_inspection_v2_scheduler_1 = require("./pm-inspection-v2.scheduler");
const pm_inspection_incident_service_1 = require("./pm-inspection-incident.service");
const pm_inspection_meeting_service_1 = require("./pm-inspection-meeting.service");
const pm_inspection_automation_config_service_1 = require("./pm-inspection-automation-config.service");
const pm_inspection_completed_event_service_1 = require("./pm-inspection-completed-event.service");
const pm_inspection_report_service_1 = require("./pm-inspection-report.service");
const pm_inspection_access_service_1 = require("./pm-inspection-access.service");
const pm_inspection_findings_log_service_1 = require("./pm-inspection-findings-log.service");
const pm_inspection_shared_service_1 = require("./pm-inspection-shared.service");
const inspection_catalog_controller_1 = require("./inspection-catalog.controller");
const inspection_catalog_service_1 = require("./inspection-catalog.service");
const audit_inspection_capa_engine_service_1 = require("./audit-inspection-capa-engine.service");
const ppe_preuse_controller_1 = require("./ppe-preuse/ppe-preuse.controller");
const ppe_preuse_service_1 = require("./ppe-preuse/ppe-preuse.service");
let PmInspectionsModule = class PmInspectionsModule {
};
exports.PmInspectionsModule = PmInspectionsModule;
exports.PmInspectionsModule = PmInspectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule,
            prisma_module_1.PrismaModule,
            safety_intelligence_module_1.SafetyIntelligenceModule,
            sif_heca_module_1.SifHecaModule,
            (0, common_1.forwardRef)(() => pm_corrective_actions_module_1.PmCorrectiveActionsModule),
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            vision_module_1.VisionModule,
            notifications_module_1.NotificationsModule,
            domain_event_bus_module_1.DomainEventBusModule,
            (0, common_1.forwardRef)(() => pm_sms_core_module_1.PmSmsCoreModule),
            (0, common_1.forwardRef)(() => pm_safety_events_module_1.PmSafetyEventsModule),
            (0, common_1.forwardRef)(() => pm_safety_meetings_module_1.PmSafetyMeetingsModule),
        ],
        controllers: [
            pm_inspections_controller_1.PmInspectionsController,
            inspection_catalog_controller_1.InspectionCatalogController,
            ppe_preuse_controller_1.PpePreUseController,
        ],
        providers: [
            pm_inspections_service_1.PmInspectionsService,
            pm_inspection_templates_service_1.PmInspectionTemplatesService,
            inspection_catalog_service_1.InspectionCatalogService,
            inspection_template_engine_1.InspectionTemplateEngine,
            inspection_scoring_engine_1.InspectionScoringEngine,
            deficiency_scoring_engine_1.DeficiencyScoringEngine,
            pm_inspections_cail_service_1.PmInspectionsCailService,
            pm_inspections_equipment_service_1.PmInspectionsEquipmentService,
            pm_inspections_ingestion_service_1.PmInspectionsIngestionService,
            pm_inspections_cail_intelligence_service_1.PmInspectionsCailIntelligenceService,
            pm_inspection_photo_pipeline_service_1.PmInspectionPhotoPipelineService,
            pm_inspection_finding_capa_service_1.PmInspectionFindingCapaService,
            pm_inspection_contractor_dispatch_service_1.PmInspectionContractorDispatchService,
            pm_inspection_dashboard_service_1.PmInspectionDashboardService,
            pm_inspection_subcontractor_resolver_service_1.PmInspectionSubcontractorResolverService,
            pm_inspection_v2_scheduler_1.PmInspectionV2Scheduler,
            pm_inspection_incident_service_1.PmInspectionIncidentService,
            pm_inspection_automation_config_service_1.PmInspectionAutomationConfigService,
            pm_inspection_meeting_service_1.PmInspectionMeetingService,
            pm_inspection_completed_event_service_1.PmInspectionCompletedEventService,
            pm_inspection_report_service_1.PmInspectionReportService,
            pm_inspection_access_service_1.PmInspectionAccessService,
            pm_inspection_findings_log_service_1.PmInspectionFindingsLogService,
            pm_inspection_shared_service_1.PmInspectionSharedService,
            audit_inspection_capa_engine_service_1.AuditInspectionCapaEngineService,
            ppe_preuse_service_1.PpePreUseService,
        ],
        exports: [
            pm_inspections_service_1.PmInspectionsService,
            pm_inspection_templates_service_1.PmInspectionTemplatesService,
            inspection_catalog_service_1.InspectionCatalogService,
            pm_inspections_ingestion_service_1.PmInspectionsIngestionService,
            pm_inspection_photo_pipeline_service_1.PmInspectionPhotoPipelineService,
            pm_inspection_dashboard_service_1.PmInspectionDashboardService,
            pm_inspection_contractor_dispatch_service_1.PmInspectionContractorDispatchService,
            pm_inspection_subcontractor_resolver_service_1.PmInspectionSubcontractorResolverService,
            pm_inspection_report_service_1.PmInspectionReportService,
            pm_inspection_access_service_1.PmInspectionAccessService,
            pm_inspection_findings_log_service_1.PmInspectionFindingsLogService,
            pm_inspection_shared_service_1.PmInspectionSharedService,
            ppe_preuse_service_1.PpePreUseService,
        ],
    })
], PmInspectionsModule);
//# sourceMappingURL=pm-inspections.module.js.map