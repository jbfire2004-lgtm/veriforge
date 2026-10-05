"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingIngestionModule = void 0;
const common_1 = require("@nestjs/common");
const training_ingestion_controller_1 = require("./training-ingestion.controller");
const training_ingestion_v1_controller_1 = require("./training-ingestion-v1.controller");
const training_ingestion_service_1 = require("./training-ingestion.service");
const ocr_extraction_service_1 = require("./ocr-extraction.service");
const ocr_field_extractor_service_1 = require("./ocr-field-extractor.service");
const training_metadata_parser_service_1 = require("./training-metadata-parser.service");
const ingestion_confidence_policy_service_1 = require("./ingestion-confidence-policy.service");
const training_qr_ingestion_service_1 = require("./training-qr-ingestion.service");
const training_provider_ingestion_service_1 = require("./training-provider-ingestion.service");
const prisma_module_1 = require("../prisma/prisma.module");
const vera_core_module_1 = require("../modules/vera-core/vera-core.module");
const core_upload_module_1 = require("../modules/core-upload/core-upload.module");
const training_standards_compliance_module_1 = require("../modules/training-standards-compliance/training-standards-compliance.module");
const training_provider_core_module_1 = require("../modules/training-provider-core/training-provider-core.module");
const domain_event_bus_module_1 = require("../modules/api-platform/events/domain-event-bus.module");
const notifications_module_1 = require("../notifications/notifications.module");
const credential_ledger_module_1 = require("../modules/credential-ledger/credential-ledger.module");
const phase1_monitoring_module_1 = require("../common/monitoring/phase1-monitoring.module");
let TrainingIngestionModule = class TrainingIngestionModule {
};
exports.TrainingIngestionModule = TrainingIngestionModule;
exports.TrainingIngestionModule = TrainingIngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            phase1_monitoring_module_1.Phase1MonitoringModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            core_upload_module_1.CoreUploadModule,
            training_standards_compliance_module_1.TrainingStandardsComplianceModule,
            training_provider_core_module_1.TrainingProviderCoreModule,
            credential_ledger_module_1.CredentialLedgerModule,
            domain_event_bus_module_1.DomainEventBusModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [training_ingestion_controller_1.TrainingIngestionController, training_ingestion_v1_controller_1.TrainingIngestionV1Controller],
        providers: [
            training_ingestion_service_1.TrainingIngestionService,
            ocr_extraction_service_1.OcrExtractionService,
            ocr_field_extractor_service_1.OcrFieldExtractorService,
            training_metadata_parser_service_1.TrainingMetadataParserService,
            ingestion_confidence_policy_service_1.IngestionConfidencePolicyService,
            training_qr_ingestion_service_1.TrainingQrIngestionService,
            training_provider_ingestion_service_1.TrainingProviderIngestionService,
        ],
        exports: [
            training_ingestion_service_1.TrainingIngestionService,
            ocr_extraction_service_1.OcrExtractionService,
            ocr_field_extractor_service_1.OcrFieldExtractorService,
            training_qr_ingestion_service_1.TrainingQrIngestionService,
            training_provider_ingestion_service_1.TrainingProviderIngestionService,
        ],
    })
], TrainingIngestionModule);
//# sourceMappingURL=training-ingestion.module.js.map