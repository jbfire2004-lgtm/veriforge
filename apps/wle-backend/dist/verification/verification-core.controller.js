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
exports.VerificationCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const public_rate_limit_decorator_1 = require("../security/decorators/public-rate-limit.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const routes_1 = require("../config/routes");
const parse_validate_training_record_query_1 = require("./parse-validate-training-record-query");
const verification_service_1 = require("./verification.service");
let VerificationCoreController = class VerificationCoreController {
    constructor(verification) {
        this.verification = verification;
    }
    async trainingRecord(id, expectedWorkerId, expectedCompanyId, expectedTrainingType, expectedCertificateNumber, expectedProvider) {
        return this.verification.validateTrainingRecord(id, (0, parse_validate_training_record_query_1.parseValidateTrainingRecordQuery)({
            expectedWorkerId,
            expectedCompanyId,
            expectedTrainingType,
            expectedCertificateNumber,
            expectedProvider,
        }));
    }
    trainingSnapshot(id) {
        return this.verification.getTrainingVerificationSnapshot(id);
    }
    completeTrainingRecord(id, req) {
        const u = req.user;
        return this.verification.completeTrainingVerification(id, (u === null || u === void 0 ? void 0 : u.id) != null ? { userId: u.id } : null);
    }
};
exports.VerificationCoreController = VerificationCoreController;
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('training/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('expectedWorkerId')),
    __param(2, (0, common_1.Query)('expectedCompanyId')),
    __param(3, (0, common_1.Query)('expectedTrainingType')),
    __param(4, (0, common_1.Query)('expectedCertificateNumber')),
    __param(5, (0, common_1.Query)('expectedProvider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VerificationCoreController.prototype, "trainingRecord", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Get)('training/:id/snapshot'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationCoreController.prototype, "trainingSnapshot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.Post)('training/:id/complete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VerificationCoreController.prototype, "completeTrainingRecord", null);
exports.VerificationCoreController = VerificationCoreController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/core/verification`),
    __metadata("design:paramtypes", [verification_service_1.VerificationService])
], VerificationCoreController);
//# sourceMappingURL=verification-core.controller.js.map