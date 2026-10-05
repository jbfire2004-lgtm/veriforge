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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingStandardsComplianceController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const public_rate_limit_decorator_1 = require("../../security/decorators/public-rate-limit.decorator");
const roles_1 = require("../vera-core/roles");
const training_standards_dto_1 = require("./dto/training-standards.dto");
const training_standards_compliance_service_1 = require("./training-standards-compliance.service");
const standards_catalog_service_1 = require("./standards-catalog.service");
const regulatory_decision_service_1 = require("./regulatory/regulatory-decision.service");
const regulatory_equivalency_service_1 = require("./regulatory/regulatory-equivalency.service");
const regulatory_decision_dto_1 = require("./dto/regulatory-decision.dto");
let TrainingStandardsComplianceController = class TrainingStandardsComplianceController {
    constructor(svc, catalog, regulatoryDecision, regulatoryEquivalency) {
        this.svc = svc;
        this.catalog = catalog;
        this.regulatoryDecision = regulatoryDecision;
        this.regulatoryEquivalency = regulatoryEquivalency;
    }
    dashboard() {
        return this.svc.dashboard();
    }
    listStandards() {
        return this.catalog.listStandards();
    }
    rejectionReasons() {
        return this.catalog.listRejectionReasons();
    }
    validateTraining(dto, req) {
        var _a;
        return this.svc.validateTraining(dto.trainingRecordId, dto.jurisdictionCode, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    postRegulatoryDecision(dto, req) {
        var _a;
        return this.regulatoryDecision.verifyTrainingAgainstRegulations({
            trainingRecordId: dto.trainingRecordId,
            jurisdictionCode: dto.jurisdictionCode,
        }, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    latestRegulatoryDecision(trainingRecordId) {
        return this.regulatoryDecision.getLatestDecision(trainingRecordId);
    }
    listRegulatoryEquivalencies() {
        return this.regulatoryEquivalency.listActive();
    }
    validateProvider(dto, req) {
        var _a;
        return this.svc.validateProvider(dto.trainingProviderId, dto.jurisdictionCode, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    validateInstructor(dto, req) {
        var _a;
        return this.svc.validateInstructor(dto.instructorId, dto.courseCode, dto.jurisdictionCode, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    validateCertificate(dto, req) {
        var _a;
        return this.svc.validateCertificate(dto.certificateQrToken, dto.trainingRecordId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    getResults(trainingRecordId, trainingProviderId, outcome, limit) {
        return this.svc.getValidationResults({
            trainingRecordId: trainingRecordId ? Number(trainingRecordId) : undefined,
            trainingProviderId: trainingProviderId
                ? Number(trainingProviderId)
                : undefined,
            outcome,
            limit: limit ? Number(limit) : undefined,
        });
    }
    async getResult(id) {
        const row = await this.svc.getValidationResult(id);
        if (!row)
            throw new common_1.NotFoundException('Validation result not found');
        return row;
    }
    approve(dto, req) {
        return this.svc.approveValidation(dto.validationResultId, req.user.id, dto.notes);
    }
    reject(dto, req) {
        return this.svc.rejectValidation(dto.validationResultId, dto.rejectionCodes, req.user.id, dto.notes);
    }
};
exports.TrainingStandardsComplianceController = TrainingStandardsComplianceController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('standards'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "listStandards", null);
__decorate([
    (0, common_1.Get)('rejection-reasons'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "rejectionReasons", null);
__decorate([
    (0, common_1.Post)('validate/training'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_standards_dto_1.ValidateTrainingDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "validateTraining", null);
__decorate([
    (0, common_1.Post)('regulatory/decision'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [regulatory_decision_dto_1.RegulatoryDecisionBodyDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "postRegulatoryDecision", null);
__decorate([
    (0, common_1.Get)('regulatory/decision/:trainingRecordId'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('trainingRecordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "latestRegulatoryDecision", null);
__decorate([
    (0, common_1.Get)('regulatory/equivalencies'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "listRegulatoryEquivalencies", null);
__decorate([
    (0, common_1.Post)('validate/provider'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_standards_dto_1.ValidateProviderDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "validateProvider", null);
__decorate([
    (0, common_1.Post)('validate/instructor'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_standards_dto_1.ValidateInstructorDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "validateInstructor", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30, 60000),
    (0, common_1.Post)('validate/certificate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_standards_dto_1.ValidateCertificateDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "validateCertificate", null);
__decorate([
    (0, common_1.Get)('results'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('trainingRecordId')),
    __param(1, (0, common_1.Query)('trainingProviderId')),
    __param(2, (0, common_1.Query)('outcome')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "getResults", null);
__decorate([
    (0, common_1.Get)('results/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrainingStandardsComplianceController.prototype, "getResult", null);
__decorate([
    (0, common_1.Post)('workflow/approve'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_standards_dto_1.ApprovalWorkflowDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('workflow/reject'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_standards_dto_1.RejectionWorkflowDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingStandardsComplianceController.prototype, "reject", null);
exports.TrainingStandardsComplianceController = TrainingStandardsComplianceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/training-standards`),
    __metadata("design:paramtypes", [training_standards_compliance_service_1.TrainingStandardsComplianceService,
        standards_catalog_service_1.StandardsCatalogService,
        regulatory_decision_service_1.RegulatoryDecisionService,
        regulatory_equivalency_service_1.RegulatoryEquivalencyService])
], TrainingStandardsComplianceController);
//# sourceMappingURL=training-standards-compliance.controller.js.map