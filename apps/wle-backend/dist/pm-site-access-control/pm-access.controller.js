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
exports.PmAccessController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_site_access_control_service_1 = require("./pm-site-access-control.service");
const pm_site_access_cail_intelligence_service_1 = require("./pm-site-access-cail-intelligence.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
const SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmAccessController = class PmAccessController {
    constructor(access, cail) {
        this.access = access;
        this.cail = cail;
    }
    validate(body, req) {
        return this.access
            .validateAccess(Object.assign(Object.assign({}, body), { actorId: req.user.id, recordAttempt: true }))
            .then((r) => (Object.assign(Object.assign({}, r), { result: this.access.mapSpecResult(r.decision), workflowState: this.access.mapWorkflowState(r.decision, !!r.overrideId) })));
    }
    override(body, req) {
        return this.access.createOverride(body, req.user.id);
    }
    offlineSync(body, req) {
        return this.access.applyOfflineSync(body.projectId, body, req.user.id);
    }
    workerProfile(id, projectId) {
        return this.access.getWorkerAccessProfile(id, parseInt(projectId, 10));
    }
    workerPredict(id, projectId) {
        return this.cail.predictAccessDenial(id, parseInt(projectId, 10));
    }
    equipmentProfile(id, projectId) {
        return this.access.getEquipmentAccessProfile(id, parseInt(projectId, 10));
    }
    equipmentPredict(id) {
        return this.cail.predictEquipmentRisk(id);
    }
};
exports.PmAccessController = PmAccessController;
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('override'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "override", null);
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Get)('worker/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "workerProfile", null);
__decorate([
    (0, common_1.Get)('worker/:id/predict'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "workerPredict", null);
__decorate([
    (0, common_1.Get)('equipment/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "equipmentProfile", null);
__decorate([
    (0, common_1.Get)('equipment/:id/predict'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmAccessController.prototype, "equipmentPredict", null);
exports.PmAccessController = PmAccessController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/access`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_site_access_control_service_1.PmSiteAccessControlService,
        pm_site_access_cail_intelligence_service_1.PmSiteAccessCailIntelligenceService])
], PmAccessController);
//# sourceMappingURL=pm-access.controller.js.map