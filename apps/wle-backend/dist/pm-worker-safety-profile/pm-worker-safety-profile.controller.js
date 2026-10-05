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
exports.PmWorkerSafetyProfileController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_worker_safety_profile_service_1 = require("./pm-worker-safety-profile.service");
const pm_worker_safety_cail_intelligence_service_1 = require("./pm-worker-safety-cail-intelligence.service");
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
let PmWorkerSafetyProfileController = class PmWorkerSafetyProfileController {
    constructor(workers, cail) {
        this.workers = workers;
        this.cail = cail;
    }
    getProfile(workerId, projectId) {
        return this.workers.getFullProfile(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    rebuild(workerId, projectId, req) {
        var _a;
        return this.workers.rebuildProfile(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined, (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id);
    }
    evaluateEnforcement(body) {
        return this.workers.enforcementGate(body.workerId, body.projectId, body.zoneCode, body.equipmentId);
    }
    listTraining(workerId) {
        return this.workers.listTraining(parseInt(workerId, 10));
    }
    listAuthorizations(workerId) {
        return this.workers.listAuthorizations(parseInt(workerId, 10));
    }
    listHazardExposure(workerId) {
        return this.workers.listHazardExposure(parseInt(workerId, 10));
    }
    listMedical(workerId) {
        return this.workers.listMedicalRestrictions(parseInt(workerId, 10));
    }
    addMedical(workerId, body, req) {
        return this.workers.addMedicalRestriction(parseInt(workerId, 10), body, req.user.id);
    }
    listOverrides(workerId) {
        return this.workers.listOverrides(parseInt(workerId, 10));
    }
    createOverride(workerId, body, req) {
        return this.workers.createOverride(parseInt(workerId, 10), body, req.user.id);
    }
    analytics(workerId) {
        return this.workers.analytics(parseInt(workerId, 10));
    }
    cailInsights(workerId, projectId) {
        return this.cail.workerInsights(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    offlineBundle(workerId) {
        return this.workers.buildOfflineBundle(parseInt(workerId, 10));
    }
    offlineSyncUpload(workerId, body, req) {
        return this.workers.applyOfflineSync(parseInt(workerId, 10), body, req.user.id);
    }
    safetyScore(workerId, projectId) {
        return this.workers.getWorkerSafetyScore(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    validateCompliance(workerId, projectId) {
        return this.workers.validateCompliance(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
    upsertTraining(workerId, body, req) {
        return this.workers.upsertTrainingSnapshot(parseInt(workerId, 10), body, req.user.id);
    }
    addAuthorization(workerId, body, req) {
        return this.workers.upsertAuthorization(parseInt(workerId, 10), body, req.user.id);
    }
    recordExposure(workerId, body, req) {
        return this.workers.recordHazardExposure(parseInt(workerId, 10), body, req.user.id);
    }
    linkCapa(workerId, body, req) {
        return this.workers.linkCorrectiveAction(parseInt(workerId, 10), body, req.user.id);
    }
};
exports.PmWorkerSafetyProfileController = PmWorkerSafetyProfileController;
__decorate([
    (0, common_1.Get)(':workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)(':workerId/rebuild'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "rebuild", null);
__decorate([
    (0, common_1.Post)('enforcement/evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "evaluateEnforcement", null);
__decorate([
    (0, common_1.Get)(':workerId/training'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "listTraining", null);
__decorate([
    (0, common_1.Get)(':workerId/authorizations'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "listAuthorizations", null);
__decorate([
    (0, common_1.Get)(':workerId/hazard-exposure'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "listHazardExposure", null);
__decorate([
    (0, common_1.Get)(':workerId/medical-restrictions'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "listMedical", null);
__decorate([
    (0, common_1.Post)(':workerId/medical-restrictions'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "addMedical", null);
__decorate([
    (0, common_1.Get)(':workerId/overrides'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "listOverrides", null);
__decorate([
    (0, common_1.Post)(':workerId/overrides'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Get)(':workerId/analytics'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)(':workerId/cail/insights'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "cailInsights", null);
__decorate([
    (0, common_1.Get)('sync/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.Post)('sync/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "offlineSyncUpload", null);
__decorate([
    (0, common_1.Get)('score/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "safetyScore", null);
__decorate([
    (0, common_1.Get)('validate/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "validateCompliance", null);
__decorate([
    (0, common_1.Post)(':workerId/training'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "upsertTraining", null);
__decorate([
    (0, common_1.Post)(':workerId/authorizations'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "addAuthorization", null);
__decorate([
    (0, common_1.Post)(':workerId/hazard-exposure'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "recordExposure", null);
__decorate([
    (0, common_1.Post)(':workerId/corrective-actions'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmWorkerSafetyProfileController.prototype, "linkCapa", null);
exports.PmWorkerSafetyProfileController = PmWorkerSafetyProfileController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/worker-safety-profile`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService,
        pm_worker_safety_cail_intelligence_service_1.PmWorkerSafetyCailIntelligenceService])
], PmWorkerSafetyProfileController);
//# sourceMappingURL=pm-worker-safety-profile.controller.js.map