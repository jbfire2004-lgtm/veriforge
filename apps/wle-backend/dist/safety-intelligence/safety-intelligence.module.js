"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyIntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const domain_event_bus_module_1 = require("../modules/api-platform/events/domain-event-bus.module");
const prisma_module_1 = require("../prisma/prisma.module");
const core_upload_module_1 = require("../modules/core-upload/core-upload.module");
const vision_module_1 = require("../modules/vision/vision.module");
const notifications_module_1 = require("../notifications/notifications.module");
const training_ingestion_module_1 = require("../training-ingestion/training-ingestion.module");
const cail_controller_1 = require("./cail/cail.controller");
const cail_service_1 = require("./cail/cail.service");
const cail_scope_service_1 = require("./cail/cail-scope.service");
const cail_emitter_service_1 = require("./cail/cail-emitter.service");
const cail_copilot_enrichment_service_1 = require("./cail/cail-copilot-enrichment.service");
const dashboards_controller_1 = require("./dashboards/dashboards.controller");
const dashboards_service_1 = require("./dashboards/dashboards.service");
const inspections_controller_1 = require("./inspections/inspections.controller");
const inspections_service_1 = require("./inspections/inspections.service");
const bbo_controller_1 = require("./bbo/bbo.controller");
const bbo_service_1 = require("./bbo/bbo.service");
const equipment_bridge_controller_1 = require("./equipment-bridge/equipment-bridge.controller");
const equipment_bridge_service_1 = require("./equipment-bridge/equipment-bridge.service");
const incidents_vsi_controller_1 = require("./incidents/incidents-vsi.controller");
const incidents_vsi_service_1 = require("./incidents/incidents-vsi.service");
const safety_intelligence_ai_service_1 = require("./ai/safety-intelligence-ai.service");
const form_cail_bridge_service_1 = require("./forms/form-cail-bridge.service");
const lessons_learned_controller_1 = require("./lessons-learned/lessons-learned.controller");
const lessons_learned_service_1 = require("./lessons-learned/lessons-learned.service");
const presentations_controller_1 = require("./presentations/presentations.controller");
const presentations_service_1 = require("./presentations/presentations.service");
const vsi_attachments_service_1 = require("./attachments/vsi-attachments.service");
const cail_overdue_scheduler_1 = require("./scheduler/cail-overdue.scheduler");
const vsi_vision_bridge_service_1 = require("./ai/vsi-vision-bridge.service");
const llm_safety_service_1 = require("./ai/llm-safety.service");
const core_action_cail_backfill_service_1 = require("./migration/core-action-cail-backfill.service");
const cail_migration_controller_1 = require("./migration/cail-migration.controller");
const predictive_risk_service_1 = require("./predictive/predictive-risk.service");
const predictive_risk_scheduler_1 = require("./scheduler/predictive-risk.scheduler");
const project_safety_role_service_1 = require("./rbac/project-safety-role.service");
const project_safety_role_controller_1 = require("./rbac/project-safety-role.controller");
const vsi_event_service_1 = require("./events/vsi-event.service");
const vsi_dashboard_revision_service_1 = require("./events/vsi-dashboard-revision.service");
const vsi_domain_event_handler_1 = require("./events/vsi-domain-event.handler");
const lesson_embedding_service_1 = require("./lessons-learned/lesson-embedding.service");
const vsi_copilot_engine_service_1 = require("./ai/copilot/vsi-copilot-engine.service");
const vsi_copilot_controller_1 = require("./ai/copilot/vsi-copilot.controller");
let SafetyIntelligenceModule = class SafetyIntelligenceModule {
};
exports.SafetyIntelligenceModule = SafetyIntelligenceModule;
exports.SafetyIntelligenceModule = SafetyIntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule,
            domain_event_bus_module_1.DomainEventBusModule,
            prisma_module_1.PrismaModule,
            core_upload_module_1.CoreUploadModule,
            vision_module_1.VisionModule,
            notifications_module_1.NotificationsModule,
            training_ingestion_module_1.TrainingIngestionModule,
        ],
        controllers: [
            cail_controller_1.CailController,
            dashboards_controller_1.VsiDashboardsController,
            inspections_controller_1.SafetyInspectionsController,
            bbo_controller_1.BboController,
            equipment_bridge_controller_1.EquipmentBridgeController,
            incidents_vsi_controller_1.IncidentsVsiController,
            lessons_learned_controller_1.LessonsLearnedController,
            presentations_controller_1.VsiPresentationsController,
            cail_migration_controller_1.CailMigrationController,
            project_safety_role_controller_1.ProjectSafetyRoleController,
            vsi_copilot_controller_1.VsiCopilotController,
        ],
        providers: [
            lessons_learned_service_1.LessonsLearnedService,
            cail_service_1.CailService,
            cail_scope_service_1.CailScopeService,
            cail_emitter_service_1.CailEmitterService,
            cail_copilot_enrichment_service_1.CailCopilotEnrichmentService,
            dashboards_service_1.VsiDashboardsService,
            inspections_service_1.SafetyInspectionsService,
            bbo_service_1.BboService,
            equipment_bridge_service_1.EquipmentBridgeService,
            incidents_vsi_service_1.IncidentsVsiService,
            safety_intelligence_ai_service_1.SafetyIntelligenceAiService,
            form_cail_bridge_service_1.FormCailBridgeService,
            presentations_service_1.VsiPresentationsService,
            lessons_learned_service_1.LessonsLearnedService,
            vsi_attachments_service_1.VsiAttachmentsService,
            cail_overdue_scheduler_1.CailOverdueScheduler,
            vsi_vision_bridge_service_1.VsiVisionBridgeService,
            llm_safety_service_1.LlmSafetyService,
            core_action_cail_backfill_service_1.CoreActionCailBackfillService,
            predictive_risk_service_1.PredictiveRiskService,
            predictive_risk_scheduler_1.PredictiveRiskScheduler,
            project_safety_role_service_1.ProjectSafetyRoleService,
            vsi_event_service_1.VsiEventService,
            vsi_dashboard_revision_service_1.VsiDashboardRevisionService,
            vsi_domain_event_handler_1.VsiDomainEventHandler,
            lesson_embedding_service_1.LessonEmbeddingService,
            vsi_copilot_engine_service_1.VsiCopilotEngineService,
        ],
        exports: [
            cail_service_1.CailService,
            cail_scope_service_1.CailScopeService,
            cail_emitter_service_1.CailEmitterService,
            cail_copilot_enrichment_service_1.CailCopilotEnrichmentService,
            equipment_bridge_service_1.EquipmentBridgeService,
            form_cail_bridge_service_1.FormCailBridgeService,
            vsi_copilot_engine_service_1.VsiCopilotEngineService,
            llm_safety_service_1.LlmSafetyService,
        ],
    })
], SafetyIntelligenceModule);
//# sourceMappingURL=safety-intelligence.module.js.map