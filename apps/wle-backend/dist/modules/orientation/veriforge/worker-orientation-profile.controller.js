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
exports.WorkerOrientationProfileController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const roles_1 = require("../../vera-core/roles");
const worker_orientation_profile_service_1 = require("./worker-orientation-profile.service");
let WorkerOrientationProfileController = class WorkerOrientationProfileController {
    constructor(profiles) {
        this.profiles = profiles;
    }
    getProfile(workerId, companyIdRaw, projectIdRaw, siteIdRaw, tradeId, unionDispatchType) {
        return this.profiles.getProfile(workerId, {
            companyId: companyIdRaw ? parseInt(companyIdRaw, 10) : undefined,
            projectId: projectIdRaw ? parseInt(projectIdRaw, 10) : undefined,
            siteId: siteIdRaw ? parseInt(siteIdRaw, 10) : undefined,
            tradeId,
            unionDispatchType,
        });
    }
};
exports.WorkerOrientationProfileController = WorkerOrientationProfileController;
__decorate([
    (0, common_1.Get)(':workerId/orientation-profile'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('siteId')),
    __param(4, (0, common_1.Query)('tradeId')),
    __param(5, (0, common_1.Query)('unionDispatchType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], WorkerOrientationProfileController.prototype, "getProfile", null);
exports.WorkerOrientationProfileController = WorkerOrientationProfileController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/workers`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [worker_orientation_profile_service_1.WorkerOrientationProfileService])
], WorkerOrientationProfileController);
//# sourceMappingURL=worker-orientation-profile.controller.js.map