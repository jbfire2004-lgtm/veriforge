"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingProviderCoreModule = void 0;
const common_1 = require("@nestjs/common");
const phase1_monitoring_module_1 = require("../../common/monitoring/phase1-monitoring.module");
const prisma_module_1 = require("../../prisma/prisma.module");
const vera_core_module_1 = require("../vera-core/vera-core.module");
const training_standards_compliance_module_1 = require("../training-standards-compliance/training-standards-compliance.module");
const training_provider_core_controller_1 = require("./training-provider-core.controller");
const training_provider_core_service_1 = require("./training-provider-core.service");
const training_provider_access_service_1 = require("./training-provider-access.service");
const training_provider_compliance_service_1 = require("./training-provider-compliance.service");
const training_provider_certificate_service_1 = require("./training-provider-certificate.service");
let TrainingProviderCoreModule = class TrainingProviderCoreModule {
};
exports.TrainingProviderCoreModule = TrainingProviderCoreModule;
exports.TrainingProviderCoreModule = TrainingProviderCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            phase1_monitoring_module_1.Phase1MonitoringModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            training_standards_compliance_module_1.TrainingStandardsComplianceModule,
        ],
        controllers: [training_provider_core_controller_1.TrainingProviderCoreController],
        providers: [
            training_provider_core_service_1.TrainingProviderCoreService,
            training_provider_access_service_1.TrainingProviderAccessService,
            training_provider_compliance_service_1.TrainingProviderComplianceService,
            training_provider_certificate_service_1.TrainingProviderCertificateService,
        ],
        exports: [
            training_provider_core_service_1.TrainingProviderCoreService,
            training_provider_access_service_1.TrainingProviderAccessService,
            training_provider_compliance_service_1.TrainingProviderComplianceService,
            training_provider_certificate_service_1.TrainingProviderCertificateService,
        ],
    })
], TrainingProviderCoreModule);
//# sourceMappingURL=training-provider-core.module.js.map