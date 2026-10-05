"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSyncModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const training_records_module_1 = require("../../training-records/training-records.module");
const pm_safety_workflow_module_1 = require("../../pm-safety-workflow/pm-safety-workflow.module");
const safety_forms_module_1 = require("../../forms/safety-forms.module");
const company_links_module_1 = require("../vera-core/company-links.module");
const vera_core_module_1 = require("../vera-core/vera-core.module");
const field_sync_controller_1 = require("./field-sync.controller");
const field_sync_service_1 = require("./field-sync.service");
const field_sync_batch_processor_1 = require("./field-sync-batch.processor");
const field_sync_delta_service_1 = require("./field-sync-delta.service");
const field_offline_bundle_service_1 = require("./field-offline-bundle.service");
let FieldSyncModule = class FieldSyncModule {
};
exports.FieldSyncModule = FieldSyncModule;
exports.FieldSyncModule = FieldSyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            company_links_module_1.CompanyLinksModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            (0, common_1.forwardRef)(() => training_records_module_1.TrainingRecordsModule),
            pm_safety_workflow_module_1.PmSafetyWorkflowModule,
            (0, common_1.forwardRef)(() => safety_forms_module_1.SafetyFormsModule),
        ],
        controllers: [field_sync_controller_1.FieldSyncController],
        providers: [
            field_sync_service_1.FieldSyncService,
            field_sync_batch_processor_1.FieldSyncBatchProcessor,
            field_sync_delta_service_1.FieldSyncDeltaService,
            field_offline_bundle_service_1.FieldOfflineBundleService,
        ],
        exports: [
            field_sync_service_1.FieldSyncService,
            field_sync_batch_processor_1.FieldSyncBatchProcessor,
            field_sync_delta_service_1.FieldSyncDeltaService,
            field_offline_bundle_service_1.FieldOfflineBundleService,
        ],
    })
], FieldSyncModule);
//# sourceMappingURL=field-sync.module.js.map