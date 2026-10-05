"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceApiService = void 0;
const common_1 = require("@nestjs/common");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
const verification_service_1 = require("../../../verification/verification.service");
const compliance_repository_1 = require("../repositories/compliance.repository");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
let ComplianceApiService = class ComplianceApiService {
    constructor(reporting, verification, complianceRepo) {
        this.reporting = reporting;
        this.verification = verification;
        this.complianceRepo = complianceRepo;
    }
    async workerCompliance(workerId) {
        const status = await this.verification.evaluateWorkerCompliance(workerId);
        if (!status) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.NOT_FOUND, 'Worker not found', {
                workerId,
            });
        }
        return status;
    }
    equipmentCompliance(companyId) {
        return this.reporting.equipmentCompliance(companyId);
    }
    projectReadiness(companyId, projectId) {
        return this.reporting.projectReadiness(companyId, projectId);
    }
    trainingExpiry(companyId) {
        return this.complianceRepo.trainingExpiryCounts(companyId);
    }
};
exports.ComplianceApiService = ComplianceApiService;
exports.ComplianceApiService = ComplianceApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService,
        verification_service_1.VerificationService,
        compliance_repository_1.ComplianceRepository])
], ComplianceApiService);
//# sourceMappingURL=compliance-api.service.js.map