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
exports.PmProjectSafetyContextController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_project_safety_context_service_1 = require("./pm-project-safety-context.service");
const pm_project_safety_cail_intelligence_service_1 = require("./pm-project-safety-cail-intelligence.service");
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
let PmProjectSafetyContextController = class PmProjectSafetyContextController {
    constructor(context, cail) {
        this.context = context;
        this.cail = cail;
    }
    getContext(projectId) {
        return this.context.getProjectContext(parseInt(projectId, 10));
    }
    getProfile(projectId) {
        return this.context.getOrCreateProfile(parseInt(projectId, 10));
    }
    updateProfile(projectId, body, req) {
        return this.context.updateProfile(parseInt(projectId, 10), body, req.user.id);
    }
    autoGenerate(projectId, req) {
        return this.context.autoGenerateProfile(parseInt(projectId, 10), req.user.id);
    }
    publishProfile(projectId, req) {
        return this.context.publishProfile(parseInt(projectId, 10), req.user.id);
    }
    listHazards(projectId, status) {
        return this.context.listHazards(parseInt(projectId, 10), status);
    }
    createHazard(projectId, body, req) {
        return this.context.createHazard(parseInt(projectId, 10), body, req.user.id);
    }
    publishHazard(hazardId, req) {
        return this.context.publishHazard(hazardId, req.user.id);
    }
    importHazards(projectId, body, req) {
        var _a;
        return this.context.importHazards(parseInt(projectId, 10), (_a = body.sources) !== null && _a !== void 0 ? _a : ['company_library'], req.user.id);
    }
    listControls(projectId) {
        return this.context.listControls(parseInt(projectId, 10));
    }
    createControl(projectId, body, req) {
        return this.context.createControl(parseInt(projectId, 10), body, req.user.id);
    }
    publishControl(controlId, req) {
        return this.context.publishControl(controlId, req.user.id);
    }
    importControls(projectId, req) {
        return this.context.importControlsFromCompanyLibrary(parseInt(projectId, 10), req.user.id);
    }
    listOverrides(projectId) {
        return this.context.listOverrides(parseInt(projectId, 10));
    }
    createOverride(projectId, body, req) {
        return this.context.createOverride(parseInt(projectId, 10), body, req.user.id);
    }
    evaluateEnforcement(projectId, body) {
        return this.context.evaluateEnforcement(parseInt(projectId, 10), body.workerChecks, body.zoneCode);
    }
    cailInsights(projectId) {
        return this.cail.projectInsights(parseInt(projectId, 10));
    }
    offlineBundle(projectId) {
        return this.context.buildOfflineBundle(parseInt(projectId, 10));
    }
    offlineSyncUpload(projectId, body, req) {
        return this.context.applyOfflineSync(parseInt(projectId, 10), body, req.user.id);
    }
    safetyScore(projectId) {
        return this.context.getProjectSafetyScore(parseInt(projectId, 10));
    }
    safetyAnalytics(projectId) {
        return this.context.analytics(parseInt(projectId, 10));
    }
    validateReadiness(projectId) {
        return this.context.validatePublishReadiness(parseInt(projectId, 10));
    }
    upsertZones(projectId, body, req) {
        return this.context.upsertZoneRules(parseInt(projectId, 10), body.zones, req.user.id);
    }
    upsertEquipment(projectId, body, req) {
        return this.context.upsertEquipmentRules(parseInt(projectId, 10), body.equipmentRules, req.user.id);
    }
    upsertTraining(projectId, body, req) {
        return this.context.upsertTrainingRequirements(parseInt(projectId, 10), body.trainingRules, req.user.id);
    }
    upsertEmergency(projectId, body, req) {
        return this.context.upsertEmergencyRequirements(parseInt(projectId, 10), body.emergencyRules, req.user.id);
    }
};
exports.PmProjectSafetyContextController = PmProjectSafetyContextController;
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "getContext", null);
__decorate([
    (0, common_1.Get)('profile/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile/:projectId/auto-generate'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "autoGenerate", null);
__decorate([
    (0, common_1.Post)('profile/:projectId/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "publishProfile", null);
__decorate([
    (0, common_1.Get)('hazards/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "listHazards", null);
__decorate([
    (0, common_1.Post)('hazards/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "createHazard", null);
__decorate([
    (0, common_1.Post)('hazards/:hazardId/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('hazardId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "publishHazard", null);
__decorate([
    (0, common_1.Post)('hazards/:projectId/import'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "importHazards", null);
__decorate([
    (0, common_1.Get)('controls/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "listControls", null);
__decorate([
    (0, common_1.Post)('controls/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "createControl", null);
__decorate([
    (0, common_1.Post)('controls/:controlId/publish'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('controlId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "publishControl", null);
__decorate([
    (0, common_1.Post)('controls/:projectId/import'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "importControls", null);
__decorate([
    (0, common_1.Get)('overrides/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "listOverrides", null);
__decorate([
    (0, common_1.Post)('overrides/:projectId'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Post)('enforcement/:projectId/evaluate'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "evaluateEnforcement", null);
__decorate([
    (0, common_1.Get)('cail/insights/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "cailInsights", null);
__decorate([
    (0, common_1.Get)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.Post)('sync/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "offlineSyncUpload", null);
__decorate([
    (0, common_1.Get)('score/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "safetyScore", null);
__decorate([
    (0, common_1.Get)('analytics/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "safetyAnalytics", null);
__decorate([
    (0, common_1.Get)('validate/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "validateReadiness", null);
__decorate([
    (0, common_1.Put)('zones/:projectId'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "upsertZones", null);
__decorate([
    (0, common_1.Put)('equipment/:projectId'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "upsertEquipment", null);
__decorate([
    (0, common_1.Put)('training/:projectId'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "upsertTraining", null);
__decorate([
    (0, common_1.Put)('emergency/:projectId'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmProjectSafetyContextController.prototype, "upsertEmergency", null);
exports.PmProjectSafetyContextController = PmProjectSafetyContextController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/project-safety-context`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_project_safety_context_service_1.PmProjectSafetyContextService,
        pm_project_safety_cail_intelligence_service_1.PmProjectSafetyCailIntelligenceService])
], PmProjectSafetyContextController);
//# sourceMappingURL=pm-project-safety-context.controller.js.map