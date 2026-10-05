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
exports.CombinedController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../modules/vera-core/roles");
const public_rate_limit_decorator_1 = require("../security/decorators/public-rate-limit.decorator");
const combined_service_1 = require("./combined.service");
const verification_service_1 = require("../verification/verification.service");
let CombinedController = class CombinedController {
    constructor(combinedService, verification) {
        this.combinedService = combinedService;
        this.verification = verification;
    }
    verifyPublic(workerRef, equipmentRef) {
        return this.verification.verifyCombinedPublic(workerRef, equipmentRef);
    }
    verifyFull(workerRef, equipmentRef) {
        return this.combinedService.verifyCombinedByRef(workerRef, equipmentRef);
    }
    view(workerRef, equipmentRef) {
        return this.combinedService.getCombinedResultViewByRef(workerRef, equipmentRef);
    }
};
exports.CombinedController = CombinedController;
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(20),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('worker')),
    __param(1, (0, common_1.Query)('equipment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CombinedController.prototype, "verifyPublic", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, common_1.Get)('full'),
    __param(0, (0, common_1.Query)('worker')),
    __param(1, (0, common_1.Query)('equipment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CombinedController.prototype, "verifyFull", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(20),
    (0, common_1.Get)('result'),
    __param(0, (0, common_1.Query)('worker')),
    __param(1, (0, common_1.Query)('equipment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CombinedController.prototype, "view", null);
exports.CombinedController = CombinedController = __decorate([
    (0, common_1.Controller)('combined'),
    __metadata("design:paramtypes", [combined_service_1.CombinedService,
        verification_service_1.VerificationService])
], CombinedController);
//# sourceMappingURL=combined.controller.js.map