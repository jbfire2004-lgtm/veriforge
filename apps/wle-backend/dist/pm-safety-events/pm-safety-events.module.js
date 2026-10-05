"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSafetyEventsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const sif_heca_module_1 = require("../sif-heca/sif-heca.module");
const vera_core_module_1 = require("../modules/vera-core/vera-core.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_inspections_module_1 = require("../pm-inspections/pm-inspections.module");
const pm_sms_core_module_1 = require("../pm-sms-core/pm-sms-core.module");
const pm_safety_ecosystem_module_1 = require("../pm-safety-ecosystem/pm-safety-ecosystem.module");
const pm_safety_events_controller_1 = require("./pm-safety-events.controller");
const pm_safety_events_service_1 = require("./pm-safety-events.service");
const pm_safety_events_library_service_1 = require("./pm-safety-events-library.service");
const event_classification_engine_1 = require("./event-classification.engine");
const severity_risk_engine_1 = require("./severity-risk.engine");
const rca_engine_1 = require("./rca.engine");
const pm_safety_events_cail_service_1 = require("./pm-safety-events-cail.service");
const pm_safety_events_ingestion_service_1 = require("./pm-safety-events-ingestion.service");
const pm_safety_events_equipment_service_1 = require("./pm-safety-events-equipment.service");
const pm_safety_events_intelligence_service_1 = require("./pm-safety-events-intelligence.service");
const pm_safety_events_investigation_service_1 = require("./pm-safety-events-investigation.service");
const pm_investigation_capa_integration_service_1 = require("./pm-investigation-capa-integration.service");
const pm_investigation_report_service_1 = require("./pm-investigation-report.service");
const incident_sif_engine_service_1 = require("./incident-sif-engine.service");
let PmSafetyEventsModule = class PmSafetyEventsModule {
};
exports.PmSafetyEventsModule = PmSafetyEventsModule;
exports.PmSafetyEventsModule = PmSafetyEventsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            safety_intelligence_module_1.SafetyIntelligenceModule,
            sif_heca_module_1.SifHecaModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            (0, common_1.forwardRef)(() => pm_corrective_actions_module_1.PmCorrectiveActionsModule),
            (0, common_1.forwardRef)(() => pm_inspections_module_1.PmInspectionsModule),
            (0, common_1.forwardRef)(() => pm_sms_core_module_1.PmSmsCoreModule),
            pm_safety_ecosystem_module_1.PmSafetyEcosystemModule,
        ],
        controllers: [pm_safety_events_controller_1.PmSafetyEventsController],
        providers: [
            pm_safety_events_service_1.PmSafetyEventsService,
            pm_safety_events_library_service_1.PmSafetyEventsLibraryService,
            event_classification_engine_1.EventClassificationEngine,
            severity_risk_engine_1.SeverityRiskEngine,
            rca_engine_1.RcaEngine,
            pm_safety_events_cail_service_1.PmSafetyEventsCailService,
            pm_safety_events_ingestion_service_1.PmSafetyEventsIngestionService,
            pm_safety_events_equipment_service_1.PmSafetyEventsEquipmentService,
            pm_safety_events_intelligence_service_1.PmSafetyEventsIntelligenceService,
            pm_safety_events_investigation_service_1.PmSafetyEventsInvestigationService,
            pm_investigation_capa_integration_service_1.PmInvestigationCapaIntegrationService,
            pm_investigation_report_service_1.PmInvestigationReportService,
            incident_sif_engine_service_1.IncidentSifEngineService,
        ],
        exports: [
            pm_safety_events_service_1.PmSafetyEventsService,
            pm_safety_events_ingestion_service_1.PmSafetyEventsIngestionService,
            incident_sif_engine_service_1.IncidentSifEngineService,
            pm_safety_events_intelligence_service_1.PmSafetyEventsIntelligenceService,
            pm_safety_events_investigation_service_1.PmSafetyEventsInvestigationService,
        ],
    })
], PmSafetyEventsModule);
//# sourceMappingURL=pm-safety-events.module.js.map