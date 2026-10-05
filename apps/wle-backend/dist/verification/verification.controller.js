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
exports.VerificationController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const public_rate_limit_decorator_1 = require("../security/decorators/public-rate-limit.decorator");
const positive_int_pipe_1 = require("../security/validation/positive-int.pipe");
const roles_1 = require("../modules/vera-core/roles");
const parse_validate_training_record_query_1 = require("./parse-validate-training-record-query");
const verification_service_1 = require("./verification.service");
let VerificationController = class VerificationController {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    verifyByToken(token) {
        return this.verificationService.verifyByPublicToken(token);
    }
    verifyWorker(ref) {
        return this.verificationService.verifyWorkerByRef(ref);
    }
    verifyWorkerFull(ref) {
        return this.verificationService.verifyWorkerFullByRef(ref);
    }
    verifyCert(id) {
        return this.verificationService.verifyCertificationPublic(id);
    }
    verifyTraining(id) {
        return this.verificationService.verifyTrainingRecordPublic(id);
    }
    verifyCoreTrainingRecord(id, expectedWorkerId, expectedCompanyId, expectedTrainingType, expectedCertificateNumber, expectedProvider) {
        return this.verificationService.validateTrainingRecord(id, (0, parse_validate_training_record_query_1.parseValidateTrainingRecordQuery)({
            expectedWorkerId,
            expectedCompanyId,
            expectedTrainingType,
            expectedCertificateNumber,
            expectedProvider,
        }));
    }
    verifyCredential(id) {
        return this.verificationService.verifyCredentialPublic(id);
    }
    verifyCompany(id) {
        return this.verificationService.verifyCompanyPublic(id);
    }
    verifySiteAccess(token) {
        return this.verificationService.verifySiteAccessPublic(token);
    }
    verifyEquipmentQuery(ref, legacyId) {
        const resolved = (ref === null || ref === void 0 ? void 0 : ref.trim()) || (legacyId === null || legacyId === void 0 ? void 0 : legacyId.trim());
        if (!resolved) {
            return this.verificationService.verifyEquipmentMissingRef();
        }
        return this.verificationService.verifyEquipmentByRef(resolved);
    }
    verifyEquipmentFullQuery(ref, legacyId) {
        const resolved = (ref === null || ref === void 0 ? void 0 : ref.trim()) || (legacyId === null || legacyId === void 0 ? void 0 : legacyId.trim());
        if (!resolved) {
            return this.verificationService.verifyEquipmentMissingRef();
        }
        return this.verificationService.verifyEquipmentFullByRef(resolved);
    }
    verifyCombined(workerRef, equipmentRef) {
        return this.verificationService.verifyCombinedPublic(workerRef, equipmentRef);
    }
};
exports.VerificationController = VerificationController;
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(60),
    (0, common_1.Get)('t/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyByToken", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(40),
    (0, common_1.Get)('worker/:ref'),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyWorker", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES, client_1.UserRole.WORKER),
    (0, common_1.Get)('worker/:ref/full'),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyWorkerFull", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('cert/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyCert", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('training/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyTraining", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('core/training-record/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __param(1, (0, common_1.Query)('expectedWorkerId')),
    __param(2, (0, common_1.Query)('expectedCompanyId')),
    __param(3, (0, common_1.Query)('expectedTrainingType')),
    __param(4, (0, common_1.Query)('expectedCertificateNumber')),
    __param(5, (0, common_1.Query)('expectedProvider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyCoreTrainingRecord", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('credential/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyCredential", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(20),
    (0, common_1.Get)('company/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyCompany", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('site-access/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifySiteAccess", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(40),
    (0, common_1.Get)('equipment'),
    __param(0, (0, common_1.Query)('ref')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyEquipmentQuery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, common_1.Get)('equipment/full'),
    __param(0, (0, common_1.Query)('ref')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyEquipmentFullQuery", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(20),
    (0, common_1.Get)('combined'),
    __param(0, (0, common_1.Query)('worker')),
    __param(1, (0, common_1.Query)('equipment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "verifyCombined", null);
exports.VerificationController = VerificationController = __decorate([
    (0, common_1.Controller)('verify'),
    __metadata("design:paramtypes", [verification_service_1.VerificationService])
], VerificationController);
//# sourceMappingURL=verification.controller.js.map