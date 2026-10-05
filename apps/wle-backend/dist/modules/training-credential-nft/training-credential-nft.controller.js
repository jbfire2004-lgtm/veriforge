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
exports.TrainingCredentialNftController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const training_credential_nft_coordinator_service_1 = require("./training-credential-nft-coordinator.service");
const training_credential_nft_projection_service_1 = require("./training-credential-nft-projection.service");
const training_credential_nft_registry_service_1 = require("./training-credential-nft-registry.service");
let TrainingCredentialNftController = class TrainingCredentialNftController {
    constructor(projection, registry, coordinator) {
        this.projection = projection;
        this.registry = registry;
        this.coordinator = coordinator;
    }
    getProjection(id) {
        return this.projection.getProjection(id);
    }
    getNft(id) {
        return this.registry.findByTrainingRecordId(id);
    }
    retryMint(id) {
        return this.coordinator.scheduleMintIfEligible(id);
    }
};
exports.TrainingCredentialNftController = TrainingCredentialNftController;
__decorate([
    (0, common_1.Get)('projection/training/:trainingRecordId'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('trainingRecordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingCredentialNftController.prototype, "getProjection", null);
__decorate([
    (0, common_1.Get)('training/:trainingRecordId'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('trainingRecordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingCredentialNftController.prototype, "getNft", null);
__decorate([
    (0, common_1.Post)('training/:trainingRecordId/retry-mint'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('trainingRecordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingCredentialNftController.prototype, "retryMint", null);
exports.TrainingCredentialNftController = TrainingCredentialNftController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/training-credential-nft`),
    __metadata("design:paramtypes", [training_credential_nft_projection_service_1.TrainingCredentialNftProjectionService,
        training_credential_nft_registry_service_1.TrainingCredentialNftRegistryService,
        training_credential_nft_coordinator_service_1.TrainingCredentialNftCoordinatorService])
], TrainingCredentialNftController);
//# sourceMappingURL=training-credential-nft.controller.js.map